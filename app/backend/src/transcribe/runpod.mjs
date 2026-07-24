// runpod.mjs — RunPod Serverless GPU worker adapter (roadmap A1c).
//
// Contract (docs/application_architecture.md, app/gpu-worker/README.md):
//   run input:  { audio_b64: "<16 kHz mono WAV>", model_version: "v2mix_s42-20260722" }
//   run output: { events: [{onset_s, offset_s, pitch, velocity, program, is_drum}],
//                 tempo_bpm, beats_s, downbeats_s, model_version, timings }
//
// Async /run + /status polling rather than /runsync: a cold start (image pull +
// model load) can outlive the synchronous window, and polling lets us narrate
// progress and cancel a job nobody is waiting for.
import { setTimeout as delay } from 'node:timers/promises';

import { sanitizeEvents } from '../events.mjs';

const TERMINAL = new Set(['COMPLETED', 'FAILED', 'CANCELLED', 'TIMED_OUT']);

/** Worker event shape -> the canonical NoteEvent schema. */
export function normalizeWorkerEvents(workerEvents) {
  const events = (workerEvents ?? []).map((e) => ({
    onset: e.onset_s,
    duration: Number.isFinite(e.offset_s) ? e.offset_s - e.onset_s : undefined,
    pitch: e.pitch,
    velocity: e.velocity,
    channel: e.is_drum ? 'drums' : 'pitched',
    // 128 is the worker's drum marker, not a GM program — drop it there.
    program: e.is_drum ? undefined : e.program,
  }));
  return sanitizeEvents(events);
}

const abortError = () => Object.assign(new Error('cancelled'), { code: 'cancelled' });
const unavailable = (m) => Object.assign(new Error(m), { code: 'transcriber_unavailable' });

export function createRunpodTranscriber(config) {
  const {
    apiKey,
    endpointId,
    modelVersion,
    baseUrl = 'https://api.runpod.ai/v2',
    pollIntervalMs = 1500,
    maxWaitMs = 5 * 60_000,
    fetchImpl = globalThis.fetch,
  } = config.runpod ?? {};

  const endpoint = `${String(baseUrl).replace(/\/$/, '')}/${endpointId}`;

  async function call(path, { method = 'GET', body, signal } = {}) {
    const res = await fetchImpl(`${endpoint}${path}`, {
      method,
      signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`RunPod ${path} returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
    }
    if (!res.ok) {
      const detail = json.error ?? json.message ?? text.slice(0, 200);
      // Auth/404 are configuration problems, not transient worker failures —
      // surfacing them as `transcriber_unavailable` keeps the UI message honest.
      if ([401, 403, 404].includes(res.status)) {
        throw unavailable(`RunPod endpoint rejected the request (${res.status}): ${detail}`);
      }
      throw new Error(`RunPod ${path} failed (${res.status}): ${detail}`);
    }
    return json;
  }

  return {
    name: 'runpod',

    async transcribe(wavBuffer, { onProgress, signal } = {}) {
      if (!apiKey || !endpointId) {
        throw unavailable('RunPod transcriber is not configured (RUNPOD_API_KEY / RUNPOD_ENDPOINT_ID)');
      }
      if (signal?.aborted) throw abortError();

      onProgress?.('sending the snippet to the GPU …');
      const submitted = await call('/run', {
        method: 'POST',
        signal,
        body: {
          input: {
            audio_b64: Buffer.from(wavBuffer).toString('base64'),
            ...(modelVersion ? { model_version: modelVersion } : {}),
          },
        },
      });

      const jobId = submitted.id;
      if (!jobId) {
        throw new Error(`RunPod /run returned no job id: ${JSON.stringify(submitted).slice(0, 200)}`);
      }

      const startedAt = Date.now();
      let status = submitted.status;
      let payload = submitted;
      let narrated = null;

      while (!TERMINAL.has(status)) {
        if (signal?.aborted) {
          call(`/cancel/${jobId}`, { method: 'POST' }).catch(() => {});
          throw abortError();
        }
        if (Date.now() - startedAt > maxWaitMs) {
          call(`/cancel/${jobId}`, { method: 'POST' }).catch(() => {});
          throw new Error(`RunPod job ${jobId} exceeded ${Math.round(maxWaitMs / 1000)} s`);
        }

        // IN_QUEUE means no worker has picked it up yet (cold start);
        // IN_PROGRESS means the model is running. Worth telling apart.
        const message = status === 'IN_PROGRESS'
          ? 'transcribing on the GPU …'
          : 'waiting for a GPU worker (cold start can take ~30 s) …';
        if (message !== narrated) {
          onProgress?.(message);
          narrated = message;
        }

        await delay(pollIntervalMs);
        payload = await call(`/status/${jobId}`);
        status = payload.status;
      }

      if (status !== 'COMPLETED') {
        const detail = payload.error ?? payload.output?.error ?? status;
        throw new Error(`RunPod job ${jobId} ${status}: ${JSON.stringify(detail).slice(0, 300)}`);
      }

      const output = payload.output ?? {};
      // The worker reports bad input and internal failures as values, so they
      // are distinguishable from transport errors.
      if (output.error) {
        throw new Error(`GPU worker error (${output.error_type ?? 'worker'}): ${output.error}`);
      }

      return {
        events: normalizeWorkerEvents(output.events),
        tempoBpm: Number.isFinite(output.tempo_bpm) ? Math.round(output.tempo_bpm) : null,
        meta: {
          adapter: 'runpod',
          jobId,
          modelVersion: output.model_version ?? modelVersion ?? null,
          beatsS: output.beats_s ?? [],
          downbeatsS: output.downbeats_s ?? [],
          meterAssumed: output.meter_assumed ?? null,
          timings: output.timings ?? {},
          waitedMs: Date.now() - startedAt,
        },
      };
    },
  };
}
