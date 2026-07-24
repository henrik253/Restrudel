// config.mjs — env-driven configuration. Reads app/backend/.env when present
// (tiny parser; Node 20's --env-file flag errors when the file is missing).
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BACKEND_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const [, key, raw] = m;
    if (process.env[key] === undefined) {
      process.env[key] = raw.replace(/^(["'])(.*)\1$/, '$2');
    }
  }
}

const int = (v, fallback) => (v !== undefined && v !== '' ? Number.parseInt(v, 10) : fallback);

/** Build the config from an env map (process.env by default, after .env merge). */
export function loadConfig(env = process.env) {
  if (env === process.env) loadDotEnv(join(BACKEND_ROOT, '.env'));
  const repoRoot = env.REPO_ROOT ?? resolve(BACKEND_ROOT, '..', '..');
  return {
    version: '0.1.0',
    port: int(env.PORT, 8787),
    logLevel: env.LOG_LEVEL ?? 'info',
    transcriber: env.TRANSCRIBER ?? 'mock',
    mockDelayMs: int(env.MOCK_DELAY_MS, 0),
    // m2s+polish | m2s | llm — per-job overridable from the client.
    defaultCodegen: env.CODEGEN ?? 'm2s+polish',
    llm: {
      provider: env.LLM_PROVIDER ?? 'auto', // auto | fake
      model: env.LLM_MODEL ?? 'claude-haiku-4-5',
      apiKey: env.ANTHROPIC_API_KEY,
      timeoutMs: int(env.LLM_TIMEOUT_MS, 300_000),
      maxAttempts: 3,
    },
    runpod: {
      apiKey: env.RUNPOD_API_KEY,
      endpointId: env.RUNPOD_ENDPOINT_ID,
      // Which checkpoint the GPU worker loads. A directory name on the RunPod
      // network volume — swapping models is this env var, not a code change.
      // Unset lets the worker use its own default.
      modelVersion: env.RUNPOD_MODEL_VERSION,
      baseUrl: env.RUNPOD_BASE_URL ?? 'https://api.runpod.ai/v2',
      pollIntervalMs: int(env.RUNPOD_POLL_INTERVAL_MS, 1500),
      // Generous: a cold start pulls the image and loads a 759 MB checkpoint.
      maxWaitMs: int(env.RUNPOD_MAX_WAIT_MS, 5 * 60_000),
    },
    m2s: {
      // Pinned submodule (GPL-3.0) invoked as a subprocess — see codegen/m2s.mjs.
      dir: env.M2S_DIR ?? join(repoRoot, 'vendor', 'MIDI-To-Strudel'),
      // The tool defaults to 64 steps/bar, which is unreadable for a 3–10 s
      // snippet; 16 keeps a bar on one line and still resolves 16th notes.
      notesPerBar: int(env.M2S_NOTES_PER_BAR, 16),
      tabSize: int(env.M2S_TAB_SIZE, 2),
      guessInstrument: (env.M2S_GUESS_INSTRUMENT ?? '1') !== '0',
      timeoutMs: int(env.M2S_TIMEOUT_MS, 60_000),
    },
    repoRoot,
    dataGenDir: env.DATA_GEN_DIR ?? join(repoRoot, 'data_gen'),
    pythonBin: env.PYTHON_BIN ?? join(repoRoot, '.venv', 'bin', 'python'),
    uploads: {
      // A8: the full track is uploaded once and cut server-side per selection.
      dir: env.UPLOAD_DIR, // default: <tmp>/restrudel-uploads
      maxBytes: int(env.MAX_UPLOAD_BYTES, 60 * 1024 * 1024), // ~60 min of mp3
      ttlMs: int(env.UPLOAD_TTL_MS, 60 * 60 * 1000),
      maxDurationSec: int(env.MAX_UPLOAD_SECONDS, 30 * 60),
      ffmpegBin: env.FFMPEG_BIN ?? 'ffmpeg',
      ffprobeBin: env.FFPROBE_BIN ?? 'ffprobe',
    },
    jobTtlMs: int(env.JOB_TTL_MS, 60 * 60 * 1000),
    validateTimeoutMs: int(env.VALIDATE_TIMEOUT_MS, 30_000),
    limits: {
      maxPayloadBytes: 1024 * 1024, // ws frame cap; connection dies above this
      maxWavBytes: int(env.MAX_WAV_BYTES, 700_000), // 10 s @ 16 kHz mono PCM16 = ~320 KB
      minSnippetSec: 3,
      maxSnippetSec: 10,
      snippetToleranceSec: 0.05,
      maxPromptChars: 2000,
    },
  };
}
