// ws_smoke.test.mjs — full job lifecycle over a real WebSocket:
// binary job.create -> queued/transcribing/generating/done -> job.result,
// then job.regenerate -> generating/done with revision 2 and NO transcribing.
// Hermetic: mock transcriber + fake LLM; needs data_gen node_modules for the
// engine validation step.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { once } from 'node:events';
import WebSocket from 'ws';
import { createApp } from '../src/server.mjs';
import { encodeJobCreate, findDataGenDir, makeTestWav, testConfig } from './helpers.mjs';

const dataGenDir = findDataGenDir();
const skip = dataGenDir ? false : 'data_gen node_modules not installed (run npm install in data_gen/)';

/**
 * Attach a message inbox BEFORE any frame can arrive — `once(ws, 'message')`
 * after `open` races the synchronously-delivered hello frame and can hang.
 */
function attachInbox(ws) {
  const all = [];
  const waiters = new Set();
  ws.on('message', (data) => {
    all.push(JSON.parse(data.toString()));
    for (const w of [...waiters]) w();
  });
  return {
    all,
    /** Resolve with the first message matching pred, scanning from index `from`. */
    next(pred, { timeoutMs = 30_000, from = 0 } = {}) {
      let cursor = from;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          waiters.delete(check);
          reject(new Error(`timeout; inbox: ${JSON.stringify(all)}`));
        }, timeoutMs);
        const check = () => {
          while (cursor < all.length) {
            const msg = all[cursor++];
            if (pred(msg)) {
              clearTimeout(timer);
              waiters.delete(check);
              return resolve(msg);
            }
          }
        };
        waiters.add(check);
        check();
      });
    },
  };
}

async function startApp(overrides = {}) {
  const config = testConfig({ transcriber: 'mock', dataGenDir, llm: { provider: 'fake' }, ...overrides });
  const app = createApp(config);
  await new Promise((r) => app.server.listen(0, r));
  return { app, port: app.server.address().port };
}

async function openSocket(port) {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
  const inbox = attachInbox(ws);
  await once(ws, 'open');
  return { ws, inbox };
}

test('full job lifecycle over the wire', { skip }, async () => {
  const { app, port } = await startApp();
  const { ws, inbox } = await openSocket(port);

  try {
    const hello = await inbox.next((m) => m.type === 'hello');
    assert.equal(hello.transcriber, 'mock');
    assert.equal(hello.limits.minSnippetSec, 3);
    assert.equal(hello.limits.maxSnippetSec, 10);

    // create a job with a 4 s synthetic WAV
    ws.send(encodeJobCreate({ requestId: 'r1', prompt: 'test', snippet: { selStartSec: 0, selEndSec: 4 } }, makeTestWav(4)));
    const accepted = await inbox.next((m) => m.type === 'job.accepted');
    assert.equal(accepted.requestId, 'r1');
    const result = await inbox.next((m) => m.type === 'job.result' || m.type === 'job.error');

    assert.equal(result.type, 'job.result');
    assert.equal(result.revision, 1);
    assert.ok(result.code.includes('stack('), 'result carries strudel code');
    assert.equal(result.tempoBpm, 120);
    assert.ok(result.events.length > 0, 'result carries the cached events');
    assert.equal(result.llm.source, 'fake');

    const statuses = inbox.all.filter((m) => m.type === 'job.status').map((m) => m.status);
    const order = ['queued', 'transcribing', 'generating', 'done'].map((s) => statuses.indexOf(s));
    assert.ok(order.every((i) => i >= 0), `status sequence complete (got: ${statuses})`);
    assert.deepEqual([...order].sort((a, b) => a - b), order, 'statuses in lifecycle order');

    // regenerate: no transcribing stage, revision bumps
    const seenBefore = inbox.all.length;
    ws.send(JSON.stringify({ type: 'job.regenerate', requestId: 'r2', jobId: accepted.jobId, prompt: 'darker' }));
    const regenResult = await inbox.next(
      (m) => m.type === 'job.result' || (m.type === 'job.error' && m.requestId === 'r2'),
      { from: seenBefore },
    );
    assert.equal(regenResult.type, 'job.result');
    assert.equal(regenResult.revision, 2);
    const regenStatuses = inbox.all.slice(seenBefore).filter((m) => m.type === 'job.status').map((m) => m.status);
    assert.ok(!regenStatuses.includes('transcribing'), `regenerate must not re-transcribe (got: ${regenStatuses})`);
    assert.ok(!regenStatuses.includes('queued'), 'regenerate skips the transcription queue');

    // subscribe from a second socket gets the terminal state resent
    const { ws: ws2, inbox: inbox2 } = await openSocket(port);
    ws2.send(JSON.stringify({ type: 'job.subscribe', jobId: accepted.jobId }));
    const resent = await inbox2.next((m) => m.type === 'job.result');
    assert.equal(resent.revision, 2);
    ws2.close();
  } finally {
    ws.close();
    app.close();
  }
});

test('oversized and out-of-range snippets are rejected', { skip }, async () => {
  const { app, port } = await startApp();
  const { ws, inbox } = await openSocket(port);

  try {
    ws.send(encodeJobCreate({ requestId: 'short' }, makeTestWav(1.5)));
    const err1 = await inbox.next((m) => m.type === 'job.error' && m.requestId === 'short');
    assert.equal(err1.code, 'snippet_out_of_range');

    ws.send(encodeJobCreate({ requestId: 'rate' }, makeTestWav(4, 44100)));
    const err2 = await inbox.next((m) => m.type === 'job.error' && m.requestId === 'rate');
    assert.equal(err2.code, 'invalid_wav');
  } finally {
    ws.close();
    app.close();
  }
});
