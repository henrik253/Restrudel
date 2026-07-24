// connection.mjs — per-socket message routing and the job<->socket
// subscription hub. Sockets are ephemeral (a job keeps running when its socket
// drops); job.subscribe reattaches after a reconnect and gets the full current
// state resent.
import { MSG, ERR, decodeBinaryJobFrame, parseWavHeader } from './protocol.mjs';

export function createConnectionHandler({ config, jobManager, uploads, log }) {
  /** @type {Map<string, Set<import('ws').WebSocket>>} jobId -> sockets */
  const subscribers = new Map();

  const send = (ws, msg) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
  };

  jobManager.on('update', (job, extra) => {
    const subs = subscribers.get(job.id);
    if (!subs?.size) return;
    for (const ws of subs) for (const msg of stateMessages(job, extra)) send(ws, msg);
  });

  /** The messages describing a job's current state (also used for resend-on-subscribe). */
  function stateMessages(job, extra = {}) {
    if (job.status === 'error') {
      return [{ type: MSG.JOB_ERROR, jobId: job.id, revision: job.revision, ...job.error }];
    }
    const status = {
      type: MSG.JOB_STATUS,
      jobId: job.id,
      revision: job.revision,
      status: job.status,
      ...(extra.message ?? job.message ? { message: extra.message ?? job.message } : {}),
      ...(extra.progress !== undefined ? { progress: extra.progress } : {}),
      ...(extra.attempt !== undefined ? { attempt: extra.attempt } : {}),
    };
    if (job.status === 'done') {
      return [status, { type: MSG.JOB_RESULT, jobId: job.id, revision: job.revision, ...job.result }];
    }
    return [status];
  }

  function subscribe(ws, jobId) {
    if (!subscribers.has(jobId)) subscribers.set(jobId, new Set());
    subscribers.get(jobId).add(ws);
  }

  /** Selection sanity — the same limits the client-cut path enforces on the WAV. */
  function validateRange(startSec, endSec, sourceDurationSec) {
    const { minSnippetSec, maxSnippetSec, snippetToleranceSec } = config.limits;
    if (!Number.isFinite(startSec) || !Number.isFinite(endSec) || startSec < 0 || endSec <= startSec) {
      return { code: ERR.BAD_MESSAGE, message: 'snippet needs a valid selStartSec/selEndSec' };
    }
    if (endSec > sourceDurationSec + snippetToleranceSec) {
      return { code: ERR.SNIPPET_OUT_OF_RANGE, message: 'selection runs past the end of the track' };
    }
    const length = endSec - startSec;
    if (length < minSnippetSec - snippetToleranceSec || length > maxSnippetSec + snippetToleranceSec) {
      return {
        code: ERR.SNIPPET_OUT_OF_RANGE,
        message: `selection must be between ${minSnippetSec} and ${maxSnippetSec} seconds`,
      };
    }
    return null;
  }

  function validateWav(wav) {
    if (wav.length > config.limits.maxWavBytes) {
      return { code: ERR.PAYLOAD_TOO_LARGE, message: `audio payload exceeds ${config.limits.maxWavBytes} bytes` };
    }
    let info;
    try {
      info = parseWavHeader(wav);
    } catch (e) {
      return { code: ERR.INVALID_WAV, message: e.message };
    }
    if (info.audioFormat !== 1 || info.channels !== 1 || info.sampleRate !== 16000 || info.bitsPerSample !== 16) {
      return { code: ERR.INVALID_WAV, message: 'expected 16 kHz mono 16-bit PCM WAV' };
    }
    const { minSnippetSec, maxSnippetSec, snippetToleranceSec } = config.limits;
    if (info.durationSec < minSnippetSec - snippetToleranceSec || info.durationSec > maxSnippetSec + snippetToleranceSec) {
      return {
        code: ERR.SNIPPET_OUT_OF_RANGE,
        message: `snippet is ${info.durationSec.toFixed(2)} s — must be ${minSnippetSec}-${maxSnippetSec} s`,
      };
    }
    return null;
  }

  return function handleConnection(ws) {
    const state = { activeJobId: null };
    send(ws, {
      type: MSG.HELLO,
      version: config.version,
      transcriber: config.transcriber,
      limits: {
        maxWavBytes: config.limits.maxWavBytes,
        minSnippetSec: config.limits.minSnippetSec,
        maxSnippetSec: config.limits.maxSnippetSec,
        maxPromptChars: config.limits.maxPromptChars,
      },
    });

    ws.on('close', () => {
      for (const set of subscribers.values()) set.delete(ws);
    });

    ws.on('message', (data, isBinary) => {
      try {
        if (isBinary) onBinary(ws, state, data);
        else onText(ws, state, data);
      } catch (e) {
        log.warn(`connection error: ${e.message}`);
        send(ws, { type: MSG.JOB_ERROR, code: ERR.BAD_MESSAGE, message: e.message });
      }
    });
  };

  function onBinary(ws, state, data) {
    const { header, wav } = decodeBinaryJobFrame(data);
    const requestId = header.requestId;
    if (header.type !== MSG.JOB_CREATE) {
      return send(ws, { type: MSG.JOB_ERROR, requestId, code: ERR.BAD_MESSAGE, message: `unexpected binary type "${header.type}"` });
    }
    if (typeof header.prompt === 'string' && header.prompt.length > config.limits.maxPromptChars) {
      return send(ws, { type: MSG.JOB_ERROR, requestId, code: ERR.PROMPT_TOO_LONG, message: `prompt exceeds ${config.limits.maxPromptChars} characters` });
    }
    const wavProblem = validateWav(wav);
    if (wavProblem) return send(ws, { type: MSG.JOB_ERROR, requestId, ...wavProblem });

    const active = state.activeJobId && jobManager.get(state.activeJobId);
    if (active && active.status !== 'done' && active.status !== 'error') {
      return send(ws, { type: MSG.JOB_ERROR, requestId, code: ERR.JOB_BUSY, message: 'a job is already running on this connection' });
    }

    const job = jobManager.createJob({
      wavBuffer: Buffer.from(wav), // copy: detach from the ws frame buffer
      prompt: header.prompt,
      codegen: header.codegen, // unknown values fall back to the default
      bpmHint: Number.isFinite(header.bpmHint) ? header.bpmHint : null,
      snippet: header.snippet ?? null,
    });
    state.activeJobId = job.id;
    subscribe(ws, job.id);
    send(ws, { type: MSG.JOB_ACCEPTED, requestId, jobId: job.id, revision: job.revision, status: job.status });
    log.info(`job ${job.id} created (${wav.length} bytes, prompt: ${header.prompt ? `${header.prompt.length} chars` : 'none'})`);
  }

  function onText(ws, state, data) {
    let msg;
    try {
      msg = JSON.parse(data.toString('utf8'));
    } catch {
      throw new Error('message is not valid JSON');
    }
    const { type, requestId, jobId } = msg;

    switch (type) {
      // A8: create a job from an already-uploaded track plus a time range. The
      // binary form (client-cut WAV) still works; this one avoids re-uploading
      // audio for every selection.
      case MSG.JOB_CREATE: {
        if (typeof msg.prompt === 'string' && msg.prompt.length > config.limits.maxPromptChars) {
          return send(ws, { type: MSG.JOB_ERROR, requestId, code: ERR.PROMPT_TOO_LONG, message: `prompt exceeds ${config.limits.maxPromptChars} characters` });
        }
        const upload = msg.uploadId ? uploads?.get(msg.uploadId) : null;
        if (!upload) {
          return send(ws, { type: MSG.JOB_ERROR, requestId, code: ERR.UPLOAD_NOT_FOUND, message: 'that upload has expired — pick the file again' });
        }

        const startSec = Number(msg.snippet?.selStartSec);
        const endSec = Number(msg.snippet?.selEndSec);
        const rangeProblem = validateRange(startSec, endSec, upload.durationSec);
        if (rangeProblem) return send(ws, { type: MSG.JOB_ERROR, requestId, ...rangeProblem });

        const active = state.activeJobId && jobManager.get(state.activeJobId);
        if (active && active.status !== 'done' && active.status !== 'error') {
          return send(ws, { type: MSG.JOB_ERROR, requestId, code: ERR.JOB_BUSY, message: 'a job is already running on this connection' });
        }

        const job = jobManager.createJob({
          source: { uploadId: upload.id, startSec, endSec },
          prompt: msg.prompt,
          codegen: msg.codegen,
          bpmHint: Number.isFinite(msg.bpmHint) ? msg.bpmHint : null,
          snippet: {
            selStartSec: startSec,
            selEndSec: endSec,
            sourceName: upload.filename,
            sourceDurationSec: upload.durationSec,
          },
        });
        state.activeJobId = job.id;
        subscribe(ws, job.id);
        send(ws, { type: MSG.JOB_ACCEPTED, requestId, jobId: job.id, revision: job.revision, status: job.status });
        log.info(`job ${job.id} created from upload ${upload.id} (${startSec.toFixed(2)}–${endSec.toFixed(2)} s)`);
        return;
      }
      case MSG.JOB_REGENERATE: {
        if (typeof msg.prompt === 'string' && msg.prompt.length > config.limits.maxPromptChars) {
          return send(ws, { type: MSG.JOB_ERROR, requestId, jobId, code: ERR.PROMPT_TOO_LONG, message: `prompt exceeds ${config.limits.maxPromptChars} characters` });
        }
        try {
          const job = jobManager.regenerate(jobId, {
            prompt: msg.prompt, bpmOverride: msg.bpmOverride, codegen: msg.codegen,
          });
          state.activeJobId = job.id;
          subscribe(ws, job.id);
          send(ws, { type: MSG.JOB_ACCEPTED, requestId, jobId: job.id, revision: job.revision, status: job.status });
        } catch (e) {
          send(ws, { type: MSG.JOB_ERROR, requestId, jobId, code: e.code ?? ERR.INTERNAL, message: e.message });
        }
        return;
      }
      case MSG.JOB_CANCEL:
        return jobManager.cancel(jobId);
      case MSG.JOB_SUBSCRIBE: {
        const job = jobManager.get(jobId);
        if (!job) {
          return send(ws, { type: MSG.JOB_ERROR, requestId, jobId, code: ERR.JOB_NOT_FOUND, message: 'job not found (it may have expired)' });
        }
        state.activeJobId = job.id;
        subscribe(ws, jobId);
        for (const m of stateMessages(job)) send(ws, m);
        return;
      }
      default:
        throw new Error(`unknown message type "${type}"`);
    }
  }
}
