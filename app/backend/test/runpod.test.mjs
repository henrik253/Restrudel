// runpod.test.mjs — the RunPod adapter against a fake RunPod API.
//
// A real HTTP server (not a stubbed fetch) so the test exercises the actual
// request/response path: headers, JSON framing, status codes, polling.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, describe, it } from 'node:test';

import { createRunpodTranscriber, normalizeWorkerEvents } from '../src/transcribe/runpod.mjs';
import { makeTestWav, testConfig } from './helpers.mjs';

const WAV = makeTestWav(4);

/** Fake RunPod endpoint. `script` decides what /status returns per poll. */
async function withFakeRunpod(handlers, fn) {
  const seen = { runBodies: [], statusPolls: 0, cancels: [], auth: [] };
  const server = createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : null;
    seen.auth.push(req.headers.authorization);

    const send = (status, payload) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payload));
    };

    if (req.url.endsWith('/run')) {
      seen.runBodies.push(body);
      return handlers.run(send, body);
    }
    if (req.url.includes('/status/')) {
      const n = seen.statusPolls++;
      return handlers.status(send, n);
    }
    if (req.url.includes('/cancel/')) {
      seen.cancels.push(req.url);
      return send(200, { status: 'CANCELLED' });
    }
    return send(404, { error: 'unexpected path' });
  });

  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  try {
    return await fn({ baseUrl: `http://127.0.0.1:${port}`, seen });
  } finally {
    server.close();
  }
}

const transcriberFor = (baseUrl, extra = {}) =>
  createRunpodTranscriber(testConfig({
    runpod: {
      apiKey: 'test-key',
      endpointId: 'ep123',
      modelVersion: 'v2mix_s42-20260722',
      baseUrl,
      pollIntervalMs: 5,
      ...extra,
    },
  }));

const WORKER_OUTPUT = {
  events: [
    { onset_s: 0.5, offset_s: 1.0, pitch: 36, velocity: 96, program: 2, is_drum: false },
    { onset_s: 0.5, offset_s: 0.51, pitch: 38, velocity: 96, program: 128, is_drum: true },
  ],
  tempo_bpm: 117.19,
  beats_s: [0.5, 1.0],
  downbeats_s: [0.5],
  meter_assumed: '4/4',
  model_version: 'v2mix_s42-20260722',
  timings: { infer_s: 6.1, device: 'cuda' },
};

describe('runpod adapter — event normalization', () => {
  it('maps the worker schema onto canonical NoteEvents', () => {
    const events = normalizeWorkerEvents(WORKER_OUTPUT.events);
    assert.equal(events.length, 2);
    assert.deepEqual(events[0], {
      onset: 0.5, duration: 0.5, pitch: 36, velocity: 96, channel: 'pitched', program: 2,
    });
    // is_drum -> channel; the worker's 128 drum marker is not a GM program.
    assert.equal(events[1].channel, 'drums');
    assert.equal(events[1].program, undefined);
  });

  it('survives missing/garbage events', () => {
    assert.deepEqual(normalizeWorkerEvents(undefined), []);
    assert.deepEqual(normalizeWorkerEvents([{ onset_s: NaN, pitch: 1 }]), []);
    // A zero-length note keeps a usable duration rather than becoming silent.
    const [e] = normalizeWorkerEvents([{ onset_s: 1, offset_s: 1, pitch: 60, velocity: 90 }]);
    assert.ok(e.duration > 0);
  });
});

describe('runpod adapter — job lifecycle', () => {
  it('reports unavailable when unconfigured', async () => {
    const t = createRunpodTranscriber(testConfig({ runpod: { apiKey: '', endpointId: '' } }));
    await assert.rejects(() => t.transcribe(WAV), (err) => err.code === 'transcriber_unavailable');
  });

  it('submits, polls to COMPLETED, and returns normalized results', async () => {
    const progress = [];
    const result = await withFakeRunpod({
      run: (send) => send(200, { id: 'job-1', status: 'IN_QUEUE' }),
      status: (send, n) => send(200, n === 0
        ? { status: 'IN_PROGRESS' }
        : { status: 'COMPLETED', output: WORKER_OUTPUT }),
    }, ({ baseUrl, seen }) => transcriberFor(baseUrl)
      .transcribe(WAV, { onProgress: (m) => progress.push(m) })
      .then((r) => ({ ...r, seen })));

    assert.equal(result.events.length, 2);
    assert.equal(result.tempoBpm, 117); // rounded
    assert.equal(result.meta.adapter, 'runpod');
    assert.equal(result.meta.jobId, 'job-1');
    assert.equal(result.meta.modelVersion, 'v2mix_s42-20260722');
    assert.deepEqual(result.meta.downbeatsS, [0.5]);
    assert.equal(result.meta.timings.device, 'cuda');

    // The request carried base64 audio + the configured model version.
    const [runBody] = result.seen.runBodies;
    assert.equal(runBody.input.model_version, 'v2mix_s42-20260722');
    assert.ok(Buffer.from(runBody.input.audio_b64, 'base64').subarray(0, 4).toString() === 'RIFF');
    assert.equal(result.seen.auth[0], 'Bearer test-key');

    // Cold start and inference are narrated differently.
    assert.ok(progress.some((m) => m.includes('cold start')));
    assert.ok(progress.some((m) => m.includes('transcribing')));
  });

  it('surfaces a worker-reported error instead of returning empty events', async () => {
    await withFakeRunpod({
      run: (send) => send(200, { id: 'job-2', status: 'IN_QUEUE' }),
      status: (send) => send(200, {
        status: 'COMPLETED',
        output: { error: 'audio must be a WAV file (missing RIFF header)', error_type: 'input' },
      }),
    }, ({ baseUrl }) => assert.rejects(
      () => transcriberFor(baseUrl).transcribe(WAV),
      /GPU worker error \(input\).*RIFF/s,
    ));
  });

  it('throws on a FAILED job', async () => {
    await withFakeRunpod({
      run: (send) => send(200, { id: 'job-3', status: 'IN_QUEUE' }),
      status: (send) => send(200, { status: 'FAILED', error: 'CUDA out of memory' }),
    }, ({ baseUrl }) => assert.rejects(
      () => transcriberFor(baseUrl).transcribe(WAV),
      /FAILED.*CUDA out of memory/s,
    ));
  });

  it('treats auth failures as configuration problems', async () => {
    await withFakeRunpod({
      run: (send) => send(401, { error: 'invalid api key' }),
      status: (send) => send(200, {}),
    }, ({ baseUrl }) => assert.rejects(
      () => transcriberFor(baseUrl).transcribe(WAV),
      (err) => err.code === 'transcriber_unavailable' && /401/.test(err.message),
    ));
  });

  it('cancels the remote job when the client aborts', async () => {
    const ac = new AbortController();
    const { seen } = await withFakeRunpod({
      run: (send) => send(200, { id: 'job-4', status: 'IN_QUEUE' }),
      status: (send) => {
        ac.abort(); // abort while the job is still queued
        send(200, { status: 'IN_QUEUE' });
      },
    }, async ({ baseUrl, seen: s }) => {
      await assert.rejects(
        () => transcriberFor(baseUrl).transcribe(WAV, { signal: ac.signal }),
        (err) => err.code === 'cancelled',
      );
      // The cancel is fire-and-forget; give the event loop a tick to send it.
      await new Promise((r) => setTimeout(r, 30));
      return { seen: s };
    });
    assert.ok(seen.cancels.some((u) => u.includes('job-4')), 'expected /cancel/job-4');
  });

  it('gives up (and cancels) after maxWaitMs', async () => {
    const { seen } = await withFakeRunpod({
      run: (send) => send(200, { id: 'job-5', status: 'IN_QUEUE' }),
      status: (send) => send(200, { status: 'IN_QUEUE' }),
    }, async ({ baseUrl, seen: s }) => {
      await assert.rejects(
        () => transcriberFor(baseUrl, { maxWaitMs: 20 }).transcribe(WAV),
        /exceeded/,
      );
      await new Promise((r) => setTimeout(r, 30));
      return { seen: s };
    });
    assert.ok(seen.cancels.some((u) => u.includes('job-5')));
  });

  it('fails loudly when /run returns no job id', async () => {
    await withFakeRunpod({
      run: (send) => send(200, { status: 'IN_QUEUE' }),
      status: (send) => send(200, {}),
    }, ({ baseUrl }) => assert.rejects(
      () => transcriberFor(baseUrl).transcribe(WAV),
      /no job id/,
    ));
  });
});

after(() => {});
