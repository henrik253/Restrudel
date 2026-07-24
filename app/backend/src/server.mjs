// server.mjs — HTTP (/healthz) + the /ws WebSocket endpoint. Static files are
// not served here: Vite handles them in dev, Caddy in production.
import { createServer } from 'node:http';
import process from 'node:process';
import { WebSocketServer } from 'ws';
import { loadConfig } from './config.mjs';
import { createConnectionHandler } from './connection.mjs';
import { JobManager } from './jobs.mjs';
import { createLlmClient } from './llm/client.mjs';
import { createLogger } from './lib/log.mjs';
import { createTranscriber } from './transcribe/index.mjs';
import { UploadStore } from './uploads.mjs';

/**
 * Read a request body with a cap, so a huge POST cannot exhaust RAM.
 *
 * Content-Length is checked first: browsers always send it, so an oversized
 * upload is refused before a single byte is read. The streaming check is the
 * backstop for clients that lie or use chunked encoding. Neither path destroys
 * the request — that would kill the socket before the error response reaches
 * the client, which surfaces as a confusing network failure instead of a 413.
 */
function readBody(req, maxBytes) {
  const tooLarge = () => Object.assign(
    new Error(`upload exceeds ${Math.round(maxBytes / 1e6)} MB`), { code: 'payload_too_large' },
  );

  const declared = Number.parseInt(req.headers['content-length'] ?? '', 10);
  if (Number.isFinite(declared) && declared > maxBytes) {
    req.resume(); // drain so the response can be written on a live socket
    return Promise.reject(tooLarge());
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let over = false;
    req.on('data', (c) => {
      if (over) return;
      size += c.length;
      if (size > maxBytes) {
        over = true;
        chunks.length = 0; // release what we already buffered
        reject(tooLarge());
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => { if (!over) resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}

/** Build the app without listening — tests inject their own config. */
export function createApp(config) {
  const log = createLogger('server', config.logLevel);
  const transcriber = createTranscriber(config);
  const llm = createLlmClient(config);
  const uploads = new UploadStore({ config, log: log.child('uploads') });
  const jobManager = new JobManager({ config, transcriber, llm, uploads, log: log.child('jobs') });

  const server = createServer((req, res) => {
    const json = (status, body) => {
      res.writeHead(status, {
        'content-type': 'application/json',
        // The SPA is served from a different origin in dev (Vite).
        'access-control-allow-origin': '*',
      });
      res.end(JSON.stringify(body));
    };

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST, GET, OPTIONS',
        'access-control-allow-headers': 'content-type, x-filename',
      });
      res.end();
      return;
    }

    if (req.url === '/healthz') {
      return json(200, {
        ok: true,
        version: config.version,
        transcriber: transcriber.name,
        activeJobs: jobManager.activeCount,
        uploads: uploads.count,
      });
    }

    // A8: the whole track is uploaded here once, right after the user picks a
    // file; selections are cut from it server-side afterwards.
    if (req.method === 'POST' && req.url === '/api/upload') {
      readBody(req, config.uploads.maxBytes)
        .then(async (buffer) => {
          if (!buffer.length) throw Object.assign(new Error('empty upload'), { code: 'invalid_media' });
          const filename = req.headers['x-filename']
            ? decodeURIComponent(String(req.headers['x-filename'])).slice(0, 200)
            : null;
          const entry = await uploads.save(buffer, { filename });
          if (entry.durationSec > config.uploads.maxDurationSec) {
            await uploads.delete(entry.id);
            throw Object.assign(
              new Error(`track is longer than ${Math.round(config.uploads.maxDurationSec / 60)} minutes`),
              { code: 'payload_too_large' },
            );
          }
          json(200, {
            uploadId: entry.id,
            durationSec: entry.durationSec,
            filename: entry.filename,
            bytes: entry.bytes,
            audio: entry.probe,
          });
        })
        .catch((e) => {
          const code = e.code ?? 'internal';
          const status = code === 'payload_too_large' ? 413
            : code === 'unsupported_media' || code === 'invalid_media' ? 415 : 500;
          if (status === 500) log.warn(`upload failed: ${e.message}`);
          json(status, { code, message: e.message });
        });
      return;
    }

    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  });

  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: config.limits.maxPayloadBytes });
  wss.on('connection', createConnectionHandler({ config, jobManager, uploads, log: log.child('ws') }));

  const close = () => {
    jobManager.close();
    uploads.close().catch(() => {});
    for (const ws of wss.clients) ws.terminate();
    wss.close();
    server.close();
  };
  return { server, wss, jobManager, uploads, log, close };
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (isMain) {
  const config = loadConfig();
  const app = createApp(config);
  app.server.listen(config.port, () => {
    app.log.info(`listening on :${config.port} (ws: /ws, transcriber: ${config.transcriber}, llm: ${config.llm.provider === 'fake' ? 'fake' : config.llm.apiKey ? 'sdk' : 'cli'})`);
  });
  const shutdown = () => {
    app.log.info('shutting down …');
    app.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
