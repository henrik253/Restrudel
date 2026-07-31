// upload.test.mjs — A8: upload a whole track once, then cut selections from it
// server-side. Exercises the real HTTP endpoint and real ffmpeg.
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { describe, it } from 'node:test';

import WebSocket from 'ws';

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { cutToWav, normalizeFloatWavToPcm16, probeAudio, TARGET_SAMPLE_RATE } from '../src/lib/audio.mjs';
import { parseWavHeader } from '../src/protocol.mjs';
import { createApp } from '../src/server.mjs';
import { findDataGenDir, makeTestWav, testConfig } from './helpers.mjs';

// ffmpeg is a deployment dependency of this path, not of the whole backend.
const hasFfmpeg = await (async () => {
  try {
    const { runCommand } = await import('../src/lib/subprocess.mjs');
    await runCommand('ffmpeg', ['-version'], { timeoutMs: 5000 });
    return true;
  } catch {
    return false;
  }
})();
const skip = hasFfmpeg ? false : 'ffmpeg not installed';

const dataGenDir = findDataGenDir();

async function startApp(overrides = {}) {
  const config = testConfig({
    transcriber: 'mock',
    dataGenDir,
    llm: { provider: 'fake' },
    defaultCodegen: 'llm', // hermetic: no python/submodule needed
    ...overrides,
  });
  // Each app gets its own uploads dir: UploadStore.close() removes its
  // directory recursively, and on the shared tmp default, concurrently
  // running test files delete each other's uploads mid-job.
  config.uploads = {
    ...config.uploads,
    dir: config.uploads.dir ?? await mkdtemp(join(tmpdir(), 'restrudel-uploads-')),
  };
  const app = createApp(config);
  await new Promise((r) => app.server.listen(0, r));
  return { app, port: app.server.address().port, config };
}

/** A 30 s WAV standing in for an uploaded track. */
const longTrack = () => makeTestWav(30, 44100);

/** Float32 mono WAV of a 440 Hz sine at `amp` — floats may exceed ±1, like a
 * decoded brickwalled master. */
function makeFloatWav(seconds, amp, sampleRate = 44100) {
  const n = Math.round(seconds * sampleRate);
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVE', 8, 'ascii');
  buf.write('fmt ', 12, 'ascii');
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(3, 20); // IEEE float
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(32, 34);
  buf.write('data', 36, 'ascii');
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeFloatLE(amp * Math.sin((2 * Math.PI * 440 * i) / sampleRate), 44 + i * 4);
  }
  return buf;
}

/** Max |sample| of a PCM16 WAV, as int16 magnitude. */
function pcm16Peak(wav) {
  const header = parseWavHeader(wav);
  const dataOffset = wav.length - header.dataBytes;
  let peak = 0;
  for (let o = dataOffset; o + 2 <= wav.length; o += 2) {
    const a = Math.abs(wav.readInt16LE(o));
    if (a > peak) peak = a;
  }
  return peak;
}

async function upload(port, body, filename = 'track.wav') {
  const res = await fetch(`http://127.0.0.1:${port}/api/upload`, {
    method: 'POST',
    headers: { 'content-type': 'application/octet-stream', 'x-filename': encodeURIComponent(filename) },
    body,
  });
  return { status: res.status, body: await res.json() };
}

describe('audio helpers', { skip }, () => {
  it('probes duration and cuts an exact 16 kHz mono snippet', async () => {
    const { app, port } = await startApp();
    try {
      const { body } = await upload(port, longTrack());
      const entry = app.uploads.get(body.uploadId);

      const probe = await probeAudio(entry.path);
      assert.ok(Math.abs(probe.durationSec - 30) < 0.2, `duration ${probe.durationSec}`);

      const wav = await cutToWav(entry.path, 10, 18);
      const header = parseWavHeader(wav);
      assert.equal(header.sampleRate, TARGET_SAMPLE_RATE, 'model input rate');
      assert.equal(header.channels, 1, 'mono');
      assert.equal(header.bitsPerSample, 16);
      assert.ok(Math.abs(header.durationSec - 8) < 0.1, `cut length ${header.durationSec}`);
    } finally {
      app.close();
    }
  });

  it('normalizes a hot source to −1 dBFS instead of clipping it', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'restrudel-test-'));
    try {
      // 1.4 peak: what a decoded 0 dBFS master with intersample overs looks like.
      const src = join(dir, 'hot.wav');
      await writeFile(src, makeFloatWav(6, 1.4));
      const wav = await cutToWav(src, 0, 5);

      const peak = pcm16Peak(wav);
      assert.ok(peak <= Math.round(0.9 * 32767), `peak ${peak} must sit at the −1 dBFS target`);
      assert.ok(peak >= Math.round(0.85 * 32767), `peak ${peak} should be normalized up to the target`);
      assert.ok(peak < 32767, 'no sample may touch full scale (that is a flattened top)');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('boosts a quiet source by at most 20 dB', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'restrudel-test-'));
    try {
      const src = join(dir, 'quiet.wav');
      await writeFile(src, makeFloatWav(6, 0.005));
      const wav = await cutToWav(src, 0, 5);

      const peak = pcm16Peak(wav);
      // 0.005 × the +20 dB cap = 0.05 full scale — NOT all the way to −1 dBFS.
      assert.ok(peak > 0.03 * 32767 && peak < 0.08 * 32767,
        `peak ${peak} should reflect the capped boost, got ${(peak / 32767).toFixed(3)} of full scale`);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects a file with no decodable audio', async () => {
    const { app, port } = await startApp();
    try {
      const { status, body } = await upload(port, Buffer.from('definitely not audio'), 'x.mp3');
      assert.equal(status, 415);
      assert.equal(body.code, 'unsupported_media');
      assert.equal(app.uploads.count, 0, 'undecodable uploads must not be kept');
    } finally {
      app.close();
    }
  });

  it('rejects an upload over the size limit', async () => {
    const { app, port } = await startApp({ uploads: { ...testConfig({}).uploads, maxBytes: 4096 } });
    try {
      const { status, body } = await upload(port, longTrack());
      assert.equal(status, 413);
      assert.equal(body.code, 'payload_too_large');
    } finally {
      app.close();
    }
  });
});

// No ffmpeg needed — the normalizer is pure Node.
describe('float→PCM16 normalization', () => {
  it('applies one linear gain and preserves the waveform shape', () => {
    const floatWav = makeFloatWav(1, 1.4, 16000);
    const wav = normalizeFloatWavToPcm16(floatWav);

    const header = parseWavHeader(wav);
    assert.equal(header.sampleRate, 16000);
    assert.equal(header.bitsPerSample, 16);
    // gain = 0.891/1.4 exactly: the 1.4 peak lands at −1 dBFS, nothing clamps.
    const peak = pcm16Peak(wav);
    assert.ok(Math.abs(peak - Math.round(10 ** (-1 / 20) * 32767)) <= 2, `peak ${peak}`);
  });

  it('leaves digital silence alone', () => {
    const wav = normalizeFloatWavToPcm16(makeFloatWav(1, 0, 16000));
    assert.equal(pcm16Peak(wav), 0);
  });
});

describe('job from an uploaded track', { skip: skip || (dataGenDir ? false : 'data_gen not installed') }, () => {
  async function connect(port) {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    const all = [];
    const waiters = new Set();
    ws.on('message', (d) => {
      all.push(JSON.parse(d.toString()));
      for (const w of [...waiters]) w();
    });
    await once(ws, 'open');
    const next = (pred, from = 0) => new Promise((resolve, reject) => {
      let cursor = from;
      const timer = setTimeout(() => reject(new Error(`timeout; inbox: ${JSON.stringify(all)}`)), 30_000);
      const check = () => {
        while (cursor < all.length) {
          const m = all[cursor++];
          if (pred(m)) { clearTimeout(timer); waiters.delete(check); return resolve(m); }
        }
      };
      waiters.add(check);
      check();
    });
    return { ws, all, next };
  }

  it('converts a selection without re-uploading audio', async () => {
    const { app, port } = await startApp();
    const { ws, all, next } = await connect(port);
    try {
      const { body } = await upload(port, longTrack(), 'my song.wav');
      assert.ok(body.uploadId);
      assert.ok(Math.abs(body.durationSec - 30) < 0.2);

      // Selection 1 — a text frame, no audio on the wire.
      ws.send(JSON.stringify({
        type: 'job.create', requestId: 'a', uploadId: body.uploadId,
        snippet: { selStartSec: 5, selEndSec: 13 },
      }));
      const result = await next((m) => m.type === 'job.result' || m.type === 'job.error');
      assert.equal(result.type, 'job.result', `unexpected: ${JSON.stringify(result)}`);
      assert.ok(result.timings.cutMs >= 0, 'cutting is timed');

      const statuses = all.filter((m) => m.type === 'job.status').map((m) => m.status);
      assert.ok(statuses.includes('cutting'), `expected a cutting stage, got ${statuses}`);

      // Selection 2 from the SAME upload — still no audio uploaded.
      const from = all.length;
      ws.send(JSON.stringify({
        type: 'job.create', requestId: 'b', uploadId: body.uploadId,
        snippet: { selStartSec: 20, selEndSec: 26 },
      }));
      const second = await next((m) => m.type === 'job.result' || m.type === 'job.error', from);
      assert.equal(second.type, 'job.result');
      assert.equal(app.uploads.count, 1, 'one upload served both selections');
    } finally {
      ws.close();
      app.close();
    }
  });

  it('rejects out-of-range and expired selections', async () => {
    const { app, port } = await startApp();
    const { ws, next } = await connect(port);
    try {
      const { body } = await upload(port, longTrack());

      ws.send(JSON.stringify({
        type: 'job.create', requestId: 'long', uploadId: body.uploadId,
        snippet: { selStartSec: 0, selEndSec: 25 }, // over maxSnippetSec
      }));
      const tooLong = await next((m) => m.requestId === 'long' && m.type === 'job.error');
      assert.equal(tooLong.code, 'snippet_out_of_range');

      ws.send(JSON.stringify({
        type: 'job.create', requestId: 'past', uploadId: body.uploadId,
        snippet: { selStartSec: 28, selEndSec: 36 }, // past the end
      }));
      const past = await next((m) => m.requestId === 'past' && m.type === 'job.error');
      assert.equal(past.code, 'snippet_out_of_range');

      ws.send(JSON.stringify({
        type: 'job.create', requestId: 'gone', uploadId: 'no-such-upload',
        snippet: { selStartSec: 0, selEndSec: 8 },
      }));
      const gone = await next((m) => m.requestId === 'gone' && m.type === 'job.error');
      assert.equal(gone.code, 'upload_not_found');
    } finally {
      ws.close();
      app.close();
    }
  });

  it('still accepts the binary client-cut path', async () => {
    const { app, port } = await startApp();
    const { ws, next } = await connect(port);
    try {
      const { encodeJobCreate } = await import('./helpers.mjs');
      ws.send(encodeJobCreate({ requestId: 'bin' }, makeTestWav(4)));
      const result = await next((m) => m.type === 'job.result' || m.type === 'job.error');
      assert.equal(result.type, 'job.result', 'the pre-A8 path must keep working');
    } finally {
      ws.close();
      app.close();
    }
  });

  it('expires uploads on sweep', async () => {
    const { app, port } = await startApp({ uploads: { ...testConfig({}).uploads, ttlMs: -1 } });
    try {
      await upload(port, longTrack());
      assert.equal(app.uploads.count, 1);
      app.uploads.sweep();
      assert.equal(app.uploads.count, 0, 'expired uploads are dropped');
    } finally {
      app.close();
    }
  });
});
