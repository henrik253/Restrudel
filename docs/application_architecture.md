# Restrudel Application — Architecture (Phase 7)

The product: a web app where a user uploads an mp3 (or any audio), **selects an
interval** (a loop of ~4–16 bars), and gets back **editable Strudel code** that
approximates it — opened directly in an embedded Strudel REPL so they can hear
it and tweak it immediately.

**Framing (deliberate):** this is a *sketch generator*, not a faithful
transcriber. The output is a starting point that sounds recognizably similar
and is meant to be edited live — which is exactly what Strudel is for. Full-song
conversion is out of scope for v1 (Strudel is cycle/loop-based; songs are
arrangement + automation that transcription cannot recover). A "sectioned song"
mode is a possible v2 (structure-segment the song, convert each section as a
loop).

## Decisions (locked 2026-07-14)

| Layer | Choice | Why |
|---|---|---|
| Frontend | **React + Vite** (SPA, static files) | No SSR needed; wavesurfer.js for interval selection; `@strudel/repl` web component embeds anywhere |
| Backend | **Node.js** on the personal server | One runtime with the Strudel engine: codegen imports `@strudel/*` and reuses `data_gen/` directly (incl. round-trip rendering) |
| GPU | **RunPod Serverless** (scale-to-zero) | Cheapest per-second GPU, plain Docker, network volume for the 759 MB checkpoint; VM spins up only per request |
| Model | **strudel50** (`comparison_20260713-222456`) for v1 | Carry-forward winner from Phase 6; swappable via versioned checkpoints (Track B feeds new ones in) |

## Topology

```
 Browser (React + Vite SPA)
   │  upload mp3 · drag interval (wavesurfer.js) · progress · @strudel/repl
   ▼  HTTPS
 Personal server (Node.js backend, Docker + reverse proxy)
   │  1. cut interval → 16 kHz mono WAV (ffmpeg)
   │  2. job queue + status (SQLite)
   │  3. call GPU endpoint, await note events
   │  4. MIDI/events → Strudel code (codegen, pure JS)
   │  5. optional: round-trip render + similarity score (data_gen renderer)
   ▼  HTTPS (RunPod API, async run + poll/webhook)
 RunPod Serverless worker (scale-to-zero GPU VM)
      Docker image: YourMT3+ code + deps
      Network volume: strudel50 last.ckpt (759 MB, versioned)
      handler: WAV in → spectrogram → autoregressive decode → note events JSON
               (+ tempo/beat estimate via librosa — Python side owns audio analysis)
```

### Why the model lives behind the backend, not the browser
The checkpoint needs a GPU for tolerable latency (seconds, vs minutes on CPU);
RunPod bills per-second only while a request runs, so idle cost is zero. The
backend hides the RunPod API key, enforces limits, and keeps the GPU contract
swappable (a Track B checkpoint or even a different host changes nothing
user-facing).

## Contracts (the seams that keep the three parts independent)

**Backend → GPU worker** (RunPod run input):
```json
{ "audio_b64": "<16 kHz mono WAV, ≤ ~60 s>",
  "model_version": "strudel50-20260713" }
```

**GPU worker → backend** (run output):
```json
{ "events": [ { "onset_s": 0.012, "offset_s": 0.25, "pitch": 57,
                "velocity": 96, "program": 81, "is_drum": false } ],
  "tempo_bpm": 128.0, "beats_s": [0.0, 0.469, ...], "downbeats_s": [0.0, 1.875, ...],
  "model_version": "strudel50-20260713", "timings": { "cold_start_s": 0, "infer_s": 0 } }
```

**Backend → frontend** (job resource, polled or SSE):
```json
{ "id": "…", "status": "queued|cutting|inferring|generating|done|error",
  "result": { "strudel_code": "…", "similarity": 0.71, "events": [...] } }
```

## Component notes

### GPU worker (`app/gpu-worker/`, Python)
- Extract the inference path already proven in `notebooks/06_benchmark.ipynb`
  (checkpoint restore + file-wise autoregressive decode) into a standalone
  package with a RunPod `handler.py`.
- Checkpoint on a RunPod **network volume**, uploaded once from Drive;
  `model_version` selects a directory → clean handoff point for Track B models.
- Tempo/beat/downbeat estimation happens **here** (librosa/madmom) — the Python
  side owns audio analysis, so the Node backend never needs audio DSP.
- Cold start (10–60 s) is the dominant latency; mitigations: slim image, model
  load at container start (FlashBoot), and honest staged progress in the UI.

### Backend (`app/backend/`, Node)
- Fastify (or Express) + SQLite for jobs; ffmpeg to cut/resample the interval.
- **Codegen module — the core new engineering** (`app/backend/src/codegen/`):
  1. `tempo_bpm` → `setcps`, downbeats → cycle boundaries;
  2. quantize onsets to a grid (16ths per cycle default, per-voice);
  3. split events by `program`/`is_drum` into voices;
  4. drums → `bd sd hh cp …` mini-notation on corpus-typical banks;
  5. pitched voices → `note("…")` + sound/effect defaults sampled from
     `analysis/results/` priors (Synth Lead → `sawtooth` + `lpf` + `release` —
     the measured corpus distribution, same priors as the generator);
  6. `stack(...)` the voices, emit formatted code.
- **Codegen is developable and testable entirely offline, no GPU**: the Phase 4/5
  aligned triples are golden tests — feed a held-out song's ground-truth events
  through codegen, render the emitted code with `data_gen/render_offline.mjs`,
  and score spectral similarity against the original render. This isolates
  codegen quality from model quality.
- **Round-trip similarity score** (same mechanism, at request time): render the
  generated code offline, compare log-mel spectrograms against the user's
  interval → a 0–1 "how close is this sketch" number shown in the UI. Unique to
  this project — the renderer *is* the target runtime.

### Frontend (`app/frontend/`, React + Vite)
- Upload → decoded waveform via **wavesurfer.js** with a draggable/resizable
  region (snap-to-beat once the tempo estimate exists is a nice v1.1).
- Staged progress (uploading → GPU starting → transcribing → generating code),
  driven by SSE or polling; cold starts must *look* intentional.
- Result: **`@strudel/repl` web component** with the generated code loaded —
  play, edit, copy. Optionally show the note events piano-roll for debugging.

### Deployment
- Personal server: `docker-compose` (backend + reverse proxy, e.g. Caddy for
  HTTPS); frontend built to static files served by the proxy.
- Secrets: RunPod API key + endpoint ID in server env only.
- Limits: max upload size, max interval length (~60 s), per-IP rate limit —
  every conversion costs real GPU cents.

## Latency & cost budget (expectation-setting)
- Warm request: interval cut (<1 s) + inference (~5–30 s for 8–16 bars) +
  codegen (<1 s) → **~10–30 s**.
- Cold request: + 10–60 s RunPod cold start → **up to ~90 s**; the UI must
  narrate this.
- Cost: A10/T4-class serverless is fractions of a cent per second → **a few
  cents per conversion**, zero when idle.

## Known risks (carried from the Phase 6 critique)
1. **Domain gap is the big one:** strudel50's numbers were measured on
   Strudel-rendered audio; real mastered mp3s are out-of-domain and accuracy
   will drop by an unknown amount. The app is therefore also the missing
   *external eval* — collect (with consent) failed/successful conversions as the
   hardest real-world test set for Track B.
2. Tempo/downbeat errors wreck grid quantization → surface the estimate in the
   UI and let the user correct BPM/offset before regenerating (cheap, no GPU).
3. Dense polyphonic mixes will transcribe poorly → the interval picker plus
   sketch framing keeps expectations right; a "drums only / lead only" toggle
   (filter events by class) is an easy pressure valve.
