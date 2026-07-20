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

/** Build the app without listening — tests inject their own config. */
export function createApp(config) {
  const log = createLogger('server', config.logLevel);
  const transcriber = createTranscriber(config);
  const llm = createLlmClient(config);
  const jobManager = new JobManager({ config, transcriber, llm, log: log.child('jobs') });

  const server = createServer((req, res) => {
    if (req.url === '/healthz') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        version: config.version,
        transcriber: transcriber.name,
        activeJobs: jobManager.activeCount,
      }));
      return;
    }
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  });

  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: config.limits.maxPayloadBytes });
  wss.on('connection', createConnectionHandler({ config, jobManager, log: log.child('ws') }));

  const close = () => {
    jobManager.close();
    for (const ws of wss.clients) ws.terminate();
    wss.close();
    server.close();
  };
  return { server, wss, jobManager, log, close };
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
