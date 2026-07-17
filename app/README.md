# Restrudel App (Phase 7 / Track A)

Upload a song, select a 3–10 s snippet in the waveform editor, get back
editable Strudel code in an embedded REPL. Design:
[docs/application_architecture.md](../docs/application_architecture.md).

```
app/
├─ frontend/   React + Vite + TypeScript SPA (waveform selection, progress, REPL)
└─ backend/    Node (plain ESM) WebSocket server (jobs, transcription, LLM codegen)
```

The pipeline per conversion:

```
browser: decode file → select 3–10 s → resample to 16 kHz mono → WAV over WS (~320 KB)
backend: transcribe (mock | local | runpod) → note events
         → 16th-grid text description (+ corpus priors + your guidance prompt)
         → LLM writes Strudel code → validated in the real engine (retry ≤3)
browser: code in an embedded <strudel-editor> — play, edit, copy, regenerate
```

“Regenerate” (new guidance/BPM) reuses the cached transcription — only the LLM
stage re-runs, so it is fast and costs no GPU/transcription time.

## Prerequisites

- Node ≥ 20 and `npm install` run in **`data_gen/`** once (installs `@strudel/*`
  and the kabelsalat patch) — the backend validates generated code by importing
  `data_gen/strudel_eval.mjs` in a worker.
- For `TRANSCRIBER=local`: the repo `.venv` and `models/` (YourMT3) checkouts
  (see `scripts/fetch_yourmt3.py`).
- For real code generation: `ANTHROPIC_API_KEY` in `app/backend/.env`, or a
  logged-in `claude` CLI (headless fallback). `LLM_PROVIDER=fake` needs neither.

## Development

Terminal 1 — backend (port 8787):

```sh
cd app/backend
npm install
cp .env.example .env   # optional; defaults are fine for mock mode
npm run dev
```

Terminal 2 — frontend (port 5173, proxies `/ws` to the backend):

```sh
cd app/frontend
npm install
npm run dev
```

Mock mode (`TRANSCRIBER=mock LLM_PROVIDER=fake`) exercises the entire flow with
no Python, no models and no API key. Set `MOCK_DELAY_MS=2000` to see the staged
progress UI.

## Backend

- **Protocol** ([src/protocol.mjs](backend/src/protocol.mjs), mirrored by
  [frontend/src/protocol.ts](frontend/src/protocol.ts)): JSON text frames plus
  one binary frame type for job creation
  (`[u32 header length][JSON header][WAV bytes]`). Job lifecycle:
  `queued → transcribing → generating → done | error`; `job.regenerate` bumps
  `revision` and never re-transcribes; `job.subscribe` reattaches after a
  reconnect and gets the current state resent.
- **Jobs** ([src/jobs.mjs](backend/src/jobs.mjs)): in-memory, TTL-swept
  (60 min), survive socket drops; transcription runs through a concurrency-1
  queue (the local adapter is CPU-heavy).
- **Transcribers** ([src/transcribe/](backend/src/transcribe/)): `mock`
  (deterministic events), `local` (subprocess
  `scripts/yourmt3_transcribe.py`), `runpod` (interface stub for A1; the
  RunPod contract is documented in the file).
- **LLM stage** ([src/llm/](backend/src/llm/)): port of
  `scripts/midi_to_strudel.py` — per-voice 16th-note grid text, system prompt
  with measured corpus priors (`analysis/results/`), the user's guidance
  spliced in as a style-only block, engine validation + event-density gate
  with up to 3 feedback retries. Validation executes LLM output in a
  **killable child process** (30 s timeout) because it is arbitrary JS — this
  is hang isolation, not a security sandbox.
- Tests: `npm test` (needs `data_gen/node_modules`; in a git worktree the
  tests fall back to the main checkout's `data_gen` automatically).

## Frontend

- Audio is decoded **in the browser** (wavesurfer), the selected region is
  sliced + downmixed + resampled to 16 kHz mono with `OfflineAudioContext` and
  encoded as PCM16 WAV client-side — the backend needs no ffmpeg and never
  sees the full song.
- Selection: wavesurfer v7 regions plugin, one region, drag/resize with
  min/max length 3–10 s enforced twice (plugin options + clamp on
  `region-updated`); loop playback via the `region-out` re-seek; space bar
  toggles play.
- The result embeds `@strudel/repl`'s `<strudel-editor>` (lazy-loaded chunk);
  play/stop is wired to the editor API since the bare component ships no
  transport controls.
- Server limits (3–10 s, payload size, prompt length) arrive in the `hello`
  message — the client never hardcodes them beyond fallback defaults.

## Production sketch (not built yet — A6)

`vite build` → static files behind Caddy (HTTPS); Caddy reverse-proxies `/ws`
(WebSocket upgrade) to the Node backend; secrets (`ANTHROPIC_API_KEY`, RunPod
credentials) live only in the server environment. See the architecture doc.
