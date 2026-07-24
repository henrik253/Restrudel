# Restrudel — Roadmap (Draft v2)

Phases 0–6 (build the data, fine-tune YourMT3+) are **done**: two fine-tuned
variants were trained and fully benchmarked (run `comparison_20260713-222456`);
**strudel50** was the Phase 6 carry-forward model — since superseded by Phase
8's **v2mix_s42**, the model the app deploys (decided 2026-07-24). v1 results +
adversarial critique:
[benchmark_interpretation_20260713.md](benchmark_interpretation_20260713.md).
Headline: corpus-test Synth Lead F1 0.000→0.515, drums 0.53→0.84, multi-instr
0.52→0.84, at the cost of −15 slakh / −11 maestro forgetting.

> **🔥 Current priority: twin tracks (decided 2026-07-14).**
> - **Track A — Application (Phase 7):** full-stack app — React+Vite frontend,
>   Node backend on the personal server, model on **RunPod Serverless**
>   (scale-to-zero GPU VM). Frontend + backend merged (PR #6); **A1 GPU
>   worker, A5 similarity, A6 deploy remain.** Design:
>   [application_architecture.md](application_architecture.md).
> - **Track B — Model v2 (Phase 8):** B0–B8 core **done** — leak-free
>   repo-level split, timbre-coverage generation, NES-MDB + Surge renderer,
>   and **v2mix (seeds 42/1337) trained + benchmarked**: corpus multi_f
>   0.207→0.46, NES-MDB 0.068→0.61. Remaining: external real-EDM eval + ship
>   the winner into the app's model registry.
>
> The tracks run in parallel and meet at a versioned model registry: the app
> ships **v2mix_s42** (decided 2026-07-24; strudel50 retired) and swaps in
> newer Track B checkpoints as they win.

## Guiding principles
- **Data-driven, not random.** We do *not* generate uniform-random notes. We
  first measure which **sounds/synths/effects real Strudel songs actually use**,
  then weight synthetic generation toward that real distribution.
- **Scalable by default.** Prefer faster-than-realtime, batch-friendly tooling.
- **Aligned triples.** Every sample is produced from one source pattern string,
  yielding perfectly-aligned **(audio WAV, MIDI/events, Strudel code)**.
- **Large data off this machine — but only the large data.** Code, the fetched
  corpus (~MB of `.js`), analysis plots, and MIDI/events are small → they live in
  **git**. Only the **GB-scale WAV audio** goes to **Google Drive** (sync
  mechanism TBD when the audio phase lands — DVC was scaffolded then removed as
  unused).

## Environment decisions (locked)
- **Compute (Phase 1–2):** run **locally** (Node + Python), artifacts committed to
  the repo. No Drive, no Colab needed yet.
- **Compute (Phase 3–4, heavy):** local or a VM; Colab optional. The authored
  `notebooks/00_setup.ipynb` (Drive mount + Node) is kept for that stage.
- **Storage:** git for code + small artifacts (corpus, analysis, MIDI);
  **Google Drive (5 TB available)** for the heavy audio + reference datasets.
  **Sync mechanism decided:** the fetch/render runs **in Colab with Drive mounted**
  (`drive.mount('/content/drive')`, `DATA_HOME = MyDrive/restrudel/datasets`), so
  downloads and WAV renders land in Drive directly — never on this server or a
  local disk. `scripts/dataset/sync_drive.sh` (rclone) is the equivalent path for
  non-Colab machines. The claude.ai Google Drive MCP connector is **not** used for
  this — it is read/search only, not a bulk-storage backend.
- **Audio render (Part B):** `OfflineAudioContext` (faster-than-realtime) first;
  headless browser as proven fallback. Validated by a spike before we depend on it.
- **Training (Goal 2):** **fine-tune** the released YourMT3+ checkpoint — *not* train
  from scratch. Venue: **Colab primary** (native Drive mount, free/cheap GPU; the
  ~60M-param model fine-tunes on a single 16–24 GB GPU). **AWS deferred** — only a
  scale fallback if we outgrow Colab session limits.

---

## Part B in plain terms (audio rendering)
Turning a Strudel pattern into a WAV has two modes:
- **Real-time:** play it and record as it plays — a 60 s clip takes 60 s. Reliable
  but does not scale.
- **Offline / faster-than-realtime (our choice):** `OfflineAudioContext` renders
  as fast as the CPU allows (a 60 s clip in ~seconds). Needs a Web Audio engine
  that runs without a browser/soundcard — in Node that's `node-web-audio-api`.
  Open risk: does **SuperDough** (Strudel's synth) run cleanly on it? → **Phase 3
  spike** answers this before we commit; headless browser is the fallback.

---

## Phase 0 — Infrastructure & storage
**Outcome:** a Colab notebook that mounts Drive, a fixed Drive layout, repo skeleton.

- [x] Repo skeleton:
  - `data_gen/` — Node: pattern templates, label pipeline, audio renderer.
  - `analysis/` — corpus fetch + sound-distribution analysis.
  - `notebooks/` — Colab orchestration notebooks.
- [x] Colab notebook `notebooks/00_setup.ipynb`: mount Drive, install Node + deps,
      sanity-check the pattern→events path. *(authored; deferred to the audio phase)*
- [x] **Repo layout** (small artifacts, in git) — *landed in adapted form:*
      `dataset/batches/<N>/{sketches,enhanced}/` + aggregated
      `sketches_all.yaml`/`enhanced_all.yaml` instead of the sketch below;
      a per-sample `manifest.jsonl` never materialized (open leftover, Phase 4).
      Original sketch:
  ```
  corpus/            # raw fetched Strudel .js songs (Phase 1)
  analysis/out/      # distribution tables + plots (Phase 1)
  dataset/
    midi/{id}.mid
    events/{id}.json # haps + synth params used
    code/{id}.js     # the source pattern
    manifest.jsonl   # one row per sample → all artifacts + params + split
  ```
- [x] **Heavy audio → Google Drive:** decided & running — Colab mounts Drive
      (`DATA_HOME = MyDrive/restrudel/datasets`, everything renders/downloads
      straight into it); `scripts/dataset/sync_drive.sh` (rclone) is the
      non-Colab path. DVC was set up then removed as unused.
- [x] Reproducibility basics: Strudel packages pinned
      (`data_gen/package-lock.json`); seeded RNG (mulberry32), seed recorded
      per generated song.

## Phase 1 — Corpus collection & sound analysis  ⭐ (do this first)
**Outcome:** ranked distributions of which sounds/synths/effects real Strudel
songs use — the evidence that drives generation.

- [x] **Fetch all available Strudel songs** into `corpus/github/` (9 repos +
      Codeberg monorepo docs; ~100 MB, < 2 GB budget). → 855 unique snippets.
- [x] **Parse** each file and extract usage of (`notebooks/01_strudel_corpus_analysis.ipynb`):
  - sound sources: `s("...")` / `sound("...")` values, `n(...)`, synth waveforms
    (`sawtooth/square/triangle/sine/fm/...`) vs sample names
  - effects/params: `lpf`, `cutoff`, `resonance`, `room`, `delay`, `gain`,
    `adsr`/`attack/decay/sustain/release`, `vowel`, `crush`, etc.
  - structure: `stack` depth (polyphony), tempo/`cps`, scales/keys, mini-notation
    complexity
- [x] **Compute & PLOT distributions** → executed notebook + `analysis/out/`
      (sources, category_mix, top_synths, top_functions by category, banks,
      mini-notation, complexity).
- [x] Document findings in the notebook's markdown → feeds Phase 4 weights.

> **Decision gate:** review the distributions together before building generators,
> so templates target the real sound palette (e.g. if `sawtooth`+`lpf` dominates
> basslines, generate accordingly).

## Phase 2 — Label pipeline (Part A: pattern → MIDI/events)  ✅ DONE
**Outcome:** deterministic, exact labels from any pattern string — no audio needed.

- [x] Node labeler `data_gen/extract_labels.mjs`: evaluate pattern
      (`@strudel/transpiler` + `@strudel/mini`) → `queryArc` → haps → MIDI/events.
      Same eval + tempo code path as the renderer → aligned by construction
      (measured median onset skew ≈ +0.3 ms).
- [x] Haps → MIDI + raw haps/synth params dumped for each song; consumed by
      `preprocess_strudel.py` to write YourMT3 `.npy` targets.
- [x] Validity gate `data_gen/strudel_eval.mjs`: a song must evaluate in the real
      engine or it is skipped and logged in `strudel_build_report.json`.
- [x] Strudel package versions pinned (`data_gen/package-lock.json`).

## Phase 3 — Audio renderer (Part B: pattern → WAV), scalable  ✅ DONE
**Outcome:** batch WAV rendering, faster-than-realtime, aligned with Phase 2 labels.

- [x] **Spike:** run SuperDough under `node-web-audio-api` + `OfflineAudioContext`;
      render one known pattern; verify it sounds correct vs strudel.cc.
      → **passed**: `data_gen/render_offline.mjs` renders synths *and* sample
      banks (TR-909) offline; demoed end-to-end (Strudel → WAV → YourMT3+ →
      MIDI) in `notebooks/03_yourmt3_demo.ipynb`. Caveats: AudioWorklet-based
      FX (crush/distort/coarse) don't load under node-web-audio-api yet;
      `stop()` idempotence shim needed (see script header).
- [x] Spike passed → batch renderer `data_gen/render_offline.mjs` (offline,
      faster-than-realtime); renders synths *and* sample banks. Fallback
      `render_browser.mjs` not needed.
- [x] Renders from the **same pattern string** used for labels (guarantees alignment).
- [x] Output standardized: 16 kHz mono WAV (matches the AMT front end).
- [ ] Remaining gap: AudioWorklet FX (crush/distort/coarse) don't load under
      `node-web-audio-api` yet — songs using them are skipped by the validity gate.

## Phase 4 — Synthetic data generation  ✅ DONE (500 sampled + 500 enhanced)
**Outcome:** the actual training corpus of aligned triples — the data YourMT3+
gets fine-tuned on. Sampler, content synthesis, validity gate, and LLM enhancement
all landed; packaging into YourMT3 format continues in Phase 5.

### The pipeline, end to end

```
        (1) SOURCES              (2) ANALYSIS                (3) GENERATION
  corpus/github/*  ──────▶  01_strudel_corpus_analysis.ipynb ──▶  sample new Strudel code
  (git submodules today;      → analysis/results/*.json      from the measured
   websites/scrapes later)      (weights, probs, Markov)     distributions
                                                                   │
        (5) FINE-TUNE DATA           (4) RENDER & LABEL            ▼
  dataset/ + manifest.jsonl  ◀──  same code string → WAV      synthetic .js
  audio → Drive,                  (Phase 3 renderer) and      pattern files
  rest → git                      → MIDI/events (Phase 2)
```

The defining property: **we re-create Strudel code from the corpus's measured
probability distributions** — not uniform-random notes. Every generated song is
statistically shaped like real Strudel music, but synthetic, unlimited in
quantity, and perfectly labeled (the code *is* the ground truth).

### Stage by stage

**(1) Sources — pluggable.** Today: the 8 corpus submodules. Later: more repos,
strudel.cc shared links, forum scrapes. Adding a source only means re-running the
analysis; nothing downstream changes. Keep the source list in one place so the
pipeline stays extensible.

**(2) Analysis — already built.** `notebooks/01_strudel_corpus_analysis.ipynb` distills
the corpus into machine-readable distributions in `analysis/results/*.json`
(consistent envelope, `weight`/`prob` fields ready for sampling):
`sounds.json`, `functions.json`, `banks.json`, `mini_notation.json`,
`sound_categories.json`, `complexity.json`, `transitions.json` (depth-1/depth-2
Markov chains of what-follows-what).

**(3) Generation — the new build.** `data_gen/generate.mjs` samples from those
JSONs to emit new `.js` pattern files:
- [x] **Sampler core** (`data_gen/generate.mjs`): chain-building by walking
      `transitions.json` — draw the head from `heads`, then repeat
      P(next | current) over `depth1[current].successors` until `__END__`;
      argument content per function from `arguments.json` (numeric: observed
      common values or quantile interpolation; string: weighted observed
      strings). Guards: head/successor whitelists (JS noise, code-arg
      functions), one sound/pitch assignment per chain.
- [x] **Analysis upgraded for the sampler** (notebook §8b): chain **heads**,
      chain **ends** (`__END__`), and **per-function argument distributions** →
      `transitions.v2` + `arguments.json`.
- [x] **Content synthesis, not sampling** (notebook §8c → `content_models.json`):
      note/sample sequences inside `note`/`n`/`s`/`sound` are generated
      token-by-token — draw a length from P(count), then a **variable-order
      back-off Markov model** (condition on the longest seen prefix, back off to
      shorter contexts, then unigram) with **temperature** `t` (default 0.2) for
      volatility. Back-off fixes dominant-token alternation (`note` adjacent-repeat
      0.11→0.08, ≈ corpus 0.05); ~73% of sequence strings are novel.
- [ ] **Structure, still to do:** voices from `complexity.json` ✅; mini-notation
      *structure* (`[]`, `<>`, euclid, `*`) is not yet synthesized around the
      tokens (flat sequences for now); optional templates
      (bassline/arp/lead/drums) as skeletons; higher-order (depth-2) token model.
- [x] **Validity gate:** every generated pattern must evaluate in the Strudel
      engine (`data_gen/strudel_eval.mjs`) and render non-silent audio — else it is
      skipped and logged. On the corpus expect ~75–80% yield.
- [x] **LLM enhancement:** `data_gen/enhance_samples.py` + `collate_enhanced.py`
      turn the 500 raw sketches into 500 musically-richer "inspired" tracks
      (`dataset/batches/batch_<N>/enhanced/*.js` → each batch's `enhanced.yaml` →
      aggregated `dataset/enhanced_all.yaml`); these are the synthetic songs that
      actually enter the fine-tuning set.
- [x] **Reproducibility:** seeded RNG (mulberry32), seed recorded per song;
      - [ ] still to do: manifest row with seed + generator version per sample.

**(4) Render & label — reuse Phases 2–3.** For each generated code string:
labels via `queryArc` → MIDI/events (Phase 2), audio via the offline renderer →
16 kHz mono WAV (Phase 3). Same string in, so audio/labels can't drift.

**(5) Package for fine-tuning.** Write `dataset/{code,midi,events}/{id}.*` to
git, `dataset/audio/{id}.wav` to Drive, one manifest row per sample
(id, seed, template, sounds used, params, split). This is exactly what Phase 6
consumes.

### Order of work — ✅ all landed
1. [x] **Labeler** (`data_gen/extract_labels.mjs`) — also the validity gate.
2. [x] **Offline renderer** (`data_gen/render_offline.mjs`) — the main technical risk, retired.
3. [x] **Generator** (`data_gen/generate.mjs`) — sampler core + content synthesis.
4. [x] **Pilot batch (500 samples)** generated, LLM-enhanced, and checked against
       corpus stats (`notebooks/01_strudel_corpus_analysis.ipynb (§11)`).

## Phase 5 — Fine-tuning corpus (Goal 1 output)  ✅ DONE (core)
**Done 2026-07:** strudel (1083 songs) + EGMD + MAESTRO + Slakh all in Drive in
YourMT3 load format — 49.6k songs / 767 h / 238 GB total. The open items below
(Lakh real-synth rendering, per-voice stems, real hand-labeled eval set) were
**deferred into Phase 8**, where they are the core of the electronic shift.

**Outcome:** a training-ready dataset in **YourMT3+'s exact load format** (16 kHz
mono WAV + `Note`/`NoteEvent` `.npy` + `yourmt3_indexes/*_file_list.json`),
assembled **in Colab straight into a Drive-mounted store** — no heavy data on this
server or a local disk. Built by `scripts/dataset/` (see its README).

### Execution model (decided)
- Colab mounts Drive; `DATA_HOME = /content/drive/MyDrive/restrudel/datasets`.
  Downloads/extracts use the VM's fast ephemeral disk, then move into Drive.
- Orchestrated by `notebooks/04_data_preparation.ipynb` (download → format → EDA →
  split-integrity checks). 5 TB of Drive means every reference set fits.

### The data categories
- [x] **Strudel — generated (synthetic, target domain).** 500 sampled + 500
      LLM-enhanced tracks rendered to aligned WAV/MIDI by `preprocess_strudel.py`.
- [x] **Strudel — corpus (real, target domain).** Train-pool (697) → train/val;
      **held-out 20% (158) → the Strudel TEST set** (deterministic hash split,
      `analysis/results/corpus_test.json`; never rendered into train/val).
- [x] **Electronic — external, labeled.** **EGMD** (electronic drums, real
      WAV↔MIDI, 45.5k songs / 444 h) installed via `install_reference_sets.py`
      and used in Phase 6 training. The Lakh electronic subset
      (`prepare_lakh.py`, scaffolded) still needs **real audio via
      Surge XT / Vital / Dexed rendering** → deferred to **Phase 8 B3**.
- [x] **Acoustic — forgetting-mitigation reference sets.** MAESTRO (1,276
      songs / 199 h) + Slakh (1,710 songs / 118 h) in Drive from YourMT3's
      hosted 16 kHz archives; mixed at 25%/15% nominal into the Phase 6 runs.

### Remaining work
- [x] Run the Colab download of EGMD/MAESTRO/Slakh into Drive — done 2026-07-07
      (total incl. strudel: 49.6k songs / 767 h / 238 GB, index paths verified).
- [ ] **Real synth audio for the Lakh electronic subset** (Surge/Vital/Dexed) —
      the highest-leverage way to add labeled electronic timbres beyond Strudel.
      → **Phase 8 B3.**
- [ ] Per-voice stems for YourMT3's cross-stem mixing augmentation (render each
      `$:`/`stack` voice separately). → **Phase 8 B6.**
- [ ] Reserve a tiny **real** eval set (hand-labeled real electronic clips) — the
      honest generalization test alongside the Strudel holdout. → **Phase 8 B8.**
- [x] **EDA of the assembled categories** in notebook 04 §7 (electronic vs.
      Strudel-generated vs. Strudel-corpus; songs/hours per split).
- [x] Register a `"strudel"` preset in YourMT3's `amt/src/config/data_presets.py`
      pointing at these file lists — done by the marker-guarded setup cells in
      notebooks 05/06 ("restrudel presets v2"), applied at runtime on each VM.

## Phase 6 — Fine-tune YourMT3+ (Goal 2)  ✅ DONE
**Done 2026-07-14** (run `comparison_20260713-222456`, checkpoints on Drive):
two variants fine-tuned from the released checkpoint (3000 steps, bsz 8, LR 1e-4,
A100) — **strudel50** (55% eff. strudel draws) and **egmd50** — and benchmarked
3 models × 8 categories via `notebooks/06_benchmark.ipynb` (training itself:
`notebooks/05_finetune.ipynb`). strudel50 > egmd50 > base on **every** strudel
category → strudel50 carried forward (since superseded by Phase 8's
v2mix_s42). Full interpretation + adversarial critique
+ accepted follow-up actions: [benchmark_interpretation_20260713.md](benchmark_interpretation_20260713.md);
those accepted actions are now Phase 8's work list.

**Outcome:** a YourMT3+ checkpoint that beats the released baseline on synth/
electronic timbres.

*Why fine-tune, not train from scratch:* the paper trained on **2× A100 for 300K
steps** across 10 datasets, but the model is **small (~60M params, <2.5% over MT3)**.
Fine-tuning the released checkpoint on our synth data tests the thesis in
**hours of GPU, not days**, and our dataset (≤2 GB) + this model fit one GPU.

- [x] Get the released checkpoint + training code (`mimbres/YourMT3`); baseline
      fixed by benchmarking the base model across all 8 eval categories (nb06).
- [x] Adapt our dataset to YourMT3+'s I/O — `scripts/dataset/preprocess_strudel.py`
      renders 16 kHz WAV + `Note`/`NoteEvent` `.npy` + `yourmt3_indexes` file
      lists from the Phase 2 labels.
- [x] Fine-tune on **Colab** (A100, bf16, 3000 steps, bsz 8): two mix variants
      via `notebooks/05_finetune.ipynb`; checkpoints back to Drive.
- [x] Evaluate note-level F1 vs. baseline — `notebooks/06_benchmark.ipynb`,
      3 models × 8 categories. *Caveat: the eval is the Strudel holdout +
      references; the hand-labeled **real**-electronic eval is still missing →
      Phase 8 B0.*
- [x] AWS Spot escalation — **not needed**; Colab A100 sufficed (~3.5 h/variant).

## Phase 7 — Application (Track A) 🔥
**Outcome:** deployed web app — upload a song, drag-select an interval (~4–16
bars), get editable Strudel code in an embedded REPL, with an honest
"sketch, not transcription" framing. Full design (topology, contracts, latency/
cost budget, risks): [application_architecture.md](application_architecture.md).

**Stack (locked):** React+Vite frontend · Node backend on the personal server ·
RunPod Serverless GPU worker (scale-to-zero VM, **v2mix_s42** checkpoint on a
network volume) · repo layout `app/{frontend,backend,gpu-worker}`.

Work packages, in dependency order:
- [x] **A0 — Contracts & skeleton:** done 2026-07-17 (adapted): the contracts
      live as **code**, not schema files — `app/backend/src/protocol.mjs`
      mirrored by `app/frontend/src/protocol.ts`, exercised end-to-end by the
      backend's ws-smoke test. `app/{backend,frontend}` scaffolded
      (`app/README.md`). docker-compose still open → folded into A6.
- [ ] **A1 — GPU worker + RunPod integration** (plan agreed 2026-07-24; wire
      contract stays note-events JSON — the worker never returns raw MIDI):
  - [ ] **A1a — worker package** `app/gpu-worker/`: extract the proven
        inference path from `notebooks/06_benchmark.ipynb` into a RunPod
        `handler.py` (model loaded at container start; checkpoint read from
        `/runpod-volume/checkpoints/<model_version>/`) + librosa
        tempo/beat/downbeat estimation; `test_input.json` local CPU smoke
        test; slim CUDA-runtime Dockerfile built `--platform linux/amd64`,
        pushed to a registry.
  - [ ] **A1b — infra (operator steps):** RunPod network volume; upload
        **v2mix_s42** from Drive (verified 2026-07-24:
        `gdrive:restrudel/checkpoints/YourMT3+_fine_tuned_v2mix_s42_20260722-050418/`
        — `last.ckpt` 759 MB + `metadata.json`; temp pod + rclone); serverless
        endpoint (volume attached, min 0 / max 1 workers, FlashBoot on);
        endpoint ID + API key into the backend env (`RUNPOD_API_KEY` /
        `RUNPOD_ENDPOINT_ID`).
  - [ ] **A1c — backend adapter:** implement the stub
        `app/backend/src/transcribe/runpod.mjs` — async `/run` + `/status`
        polling (a cold start can outlive the sync window), cancel/timeout
        handling, normalize to the canonical NoteEvent schema.
  - [ ] **A1d — measure** cold/warm latency + cost per conversion (feeds the
        decision gate below).
  - [ ] **A1e — model swappability (requirement, not a step):**
        `model_version` is config, not code — the backend env selects it, the
        worker resolves `/runpod-volume/checkpoints/<model_version>/`.
        Deploying a future model = upload a new checkpoint directory + flip
        the env var, zero code changes; transcriber and codegen stay
        pluggable adapters.
- [x] **A2 — Codegen:** done 2026-07-17, **decision changed (user): LLM-based,
      not rule-based** — port of `scripts/midi_to_strudel.py` to Node in
      `app/backend/src/llm/`: per-voice 16th-grid text description, system
      prompt carrying the measured `analysis/results/` priors, the user's
      guidance prompt spliced in (style-only), output validated in the real
      Strudel engine (killable child process running
      `data_gen/strudel_eval.mjs`) + event-density gate, ≤3 feedback retries.
      Still open (→ A5): the offline golden-triple regression harness
      (ground-truth events → codegen → render → spectral similarity).
- [x] **A3 — Backend:** done 2026-07-17 (adapted): **WebSocket** instead of
      SSE/poll (decided 2026-07-16), in-memory job store w/ TTL instead of
      SQLite (single server, low traffic; JSONL persistence seam noted for
      A6), and **no ffmpeg** — the browser cuts/downmixes/resamples the
      3–10 s snippet to 16 kHz mono WAV client-side. Transcriber adapters
      mock/local/runpod; size + snippet-length + prompt limits; regenerate
      re-runs only the LLM stage against cached events. 15 tests green
      (`app/backend`, `npm test`).
- [x] **A4 — Frontend:** done 2026-07-17: dark studio UI; upload →
      wavesurfer.js region selection (**3–10 s**, clamped, loop playback,
      spacebar), staged progress with narration + cancel, result in an
      embedded `@strudel/repl` editor with play/stop/copy, guidance-prompt
      disclosure, BPM correction + regenerate (no re-transcription),
      auto-reconnect with job resubscribe. Verified end-to-end in the browser
      on the mock path; real-LLM path pending credentials (claude CLI login
      expired on the dev machine / no API key).
- [ ] **A5 — Round-trip similarity score:** render the generated code, compare
      log-mel spectrograms vs. the input interval → 0–1 score in the UI; same
      harness doubles as A2's regression metric.
- [ ] **A6 — Deploy + feedback loop:** personal server behind Caddy/HTTPS;
      opt-in storage of uploaded intervals + scores → they become Track B's
      hardest real-world eval set.
- [ ] **A7 — Selectable MIDI→Strudel codegen + AI polish** (agreed
      2026-07-24; buildable offline against cached/mock events, parallel to
      A1):
  - [ ] **A7a — events→MIDI module** `app/backend/src/midi/`: note events +
        tempo → `.mid` buffer (one track per program, drums on channel 9);
        unit-tested against golden Phase-2 label events.
  - [ ] **A7b — MIDI-To-Strudel adapter:** pin
        `github.com/Emanuel-de-Jong/MIDI-To-Strudel` (GPL-3.0, Python, dep
        `mido`) as a shallow submodule, run as a **subprocess** per job
        (`Midi-to-Strudel.py -m job.mid --guess-instrument`, scratch dir);
        output gated by `strudel_eval.mjs`. Its 4/4-only limitation matches
        the pipeline's 4/4 assumption.
  - [ ] **A7c — AI polish stage:** reuse `app/backend/src/llm/` — input =
        tool output + the user's optional guidance prompt; instruction:
        readable/idiomatic, apply the guidance, **do not change the notes**;
        engine-validation + density gate; on failure fall back to the
        unpolished tool output. On by default, toggleable in the UI.
  - [ ] **A7d — selection plumbing:** `codegen` field in the WS job protocol
        + frontend selector — **`m2s+polish` (default) | `m2s` (raw tool) |
        `llm` (the A2 path, kept)**; regenerate switches modes against cached
        events (no re-transcription, no GPU cost).
  - [ ] **A7e — end-to-end:** mock-path tests per adapter; one real snippet
        through upload → RunPod → MIDI → tool → polish → REPL; record
        latency + cost.
- [ ] **A8 — Upload-flow rework: backend-side snippet cutting** (decided
      2026-07-24; supersedes A3's client-side slicing):
  - [ ] Full song uploads to the backend **immediately on file select**
        (stored per session, TTL'd); a range selection then sends only
        `{start_s, end_s}` — no audio re-upload per selection.
  - [ ] Backend cuts + downmixes + resamples the selected snippet to 16 kHz
        mono WAV (ffmpeg returns to the backend) and forwards it to the GPU
        worker.
  - [ ] Frontend keeps the wavesurfer selection UX; size/length limit checks
        move server-side (snippet length limits unchanged).
  - [ ] Why: snappier select→convert loop (re-select and re-transcribe
        without re-uploading), and the backend owns the canonical audio that
        A5 (similarity) and A6 (opt-in storage) need anyway.

> **Decision gate (after A1):** if real-mp3 transcription quality is unusable
> (domain gap), the app pivots to "Strudel-ish input first" demo scope while
> Track B closes the gap — the architecture doesn't change either way.

## Phase 8 — Model v2: shift to electronic music (Track B) 🔥
**Outcome:** a checkpoint that beats strudel50 on **real electronic music**
(not just Strudel-rendered audio), with forgetting no worse, measured on a
trustworthy eval. **Strict ordering (decided 2026-07-15): ground truth → data
reset → corpus growth → strategy rethink → split by repository → only then
generate → only then train** (the Phase 6 split leaked; regenerating before
re-splitting would bake the leak in again).

- [x] **B0 — Ground truth: what did the base model train on?** Done 2026-07-15.
      Base's entire synth-timbre experience = **~26 static Kontakt sample
      patches** (Slakh; 14 lead + 12 pad) — nothing live-synthesized.
      **Synth Bass (GM 38–39) was never seen at all** (Slakh skipped all 27
      synth-bass stems; the class folds into Electric Bass) — explains our
      Bass 0.000. Its own eval: Synth Lead F1 **0.820 in-domain → 0.023 on
      RWC-Pop** (Pad 0.413 → 0.009). E-GMD contributed electronic *drum-module*
      timbres only. Consequence: few static timbres from one renderer ⇒ the
      same cliff one renderer over — B2–B6 maximize timbre/renderer diversity.
- [x] **B1 — Purge the leak-tainted generated data.** Done 2026-07-15: removed
      `dataset/batches/` (2009 files) + `enhanced_all.yaml`/`sketches_all.yaml`;
      `scripts/dataset/purge_generated_drive.py` (dry-run by default) removes
      the Drive renders + index entries. Generator code and the real corpus
      untouched; regenerated train-side only in B6.
- [x] **B2 — Grow the corpus: scrape strudel.cc.** Done 2026-07-15 — **public
      supply is saturated**: strudel.cc's examples are already in-corpus (via
      the two Strudel-repo sources' `tunes.mjs`), no scrapeable public gallery
      exists, the GitHub ecosystem is tooling not songs, and the 4 candidate
      repos found are blocked on license or format. Built `corpus/sources.yaml`
      (pluggable manifest: 8 ingested + 4 candidates with blockers) +
      `scripts/corpus/add_sources.sh`. Real growth = generation (B6) + app
      uploads (A6).
- [x] **B3 — External labeled electronic data.** Survey done 2026-07-15;
      executed 2026-07-17 (locally — no Colab needed):
      - **NES-MDB built: 5,274 songs / 46.1 h / 5.5 GB**, official in-tarball
        split (4500/402/372); **synth bass (prog 38) in 4,670 songs** — the
        class Slakh dropped; render via ValleyBell/libvgm `vgm2wav` (VGMs loop
        → truncated to label duration); noise voice → GM drums on ch 9.
      - **Surge XT + DawDreamer work headless** (136× realtime, no xvfb);
        `scripts/dataset/render_synths.py` **implemented**: drives Surge's
        2855 live params for timbre coverage (`.fxp` preset load is VST2-only
        → parameter route instead); fixed stuck-voice tails, startup click,
        phantom labels from inaudible voices, pitch-bend/CC leakage; verified
        0/12 misaligned.
      - **GigaMIDI: 2,000 electronic MIDIs staged** — license is **CC BY-NC
        4.0** (thesis-OK, blocks commercial use); feedstock only, no audio.
      - Rejected: NSynth (static samples = Slakh trap), fluidsynth/SF2
        (sampled), BitMIDI/VGMusic (unlicensed).
      - [ ] Surge render of the GigaMIDI feedstock: wired into nb04
            (`DOWNLOAD['synth']`) but **never executed** at scale.
- [x] **B4 — Generation/augmentation strategy.** Done 2026-07-15. Decisions:
      **S1** timbre sampled for *coverage*, not corpus frequency (notes/rhythm
      keep the corpus distribution); **S2** add time-preserving audio-domain
      augmentation (mastering chain); **S3** drum-bank rotation; mini-notation
      structure not worth investing (vary density instead); LLM-enhance
      repurposed to timbre-diversification, optional + ablation-gated.
- [x] **B5 — Split by SOURCE, frozen.** Done 2026-07-15: leave-repositories-out
      — **TEST = strudel-songs-collection (eefano) + strudel_trance (honcoops)
      = 124 patterns, held-out authors; TRAIN = the other 6 sources (731)**;
      the two Strudel forks stay together in train (shared `tunes.mjs`).
      Source of truth: `TEST_REPOS` in `preprocess_strudel.py` + notebook 01,
      mirrored by `split_role` in `corpus/sources.yaml`. Distributions
      recomputed **train-side only** (all 10 `analysis/results/*.json`,
      `corpus_test.json` v2). Dedup audit (`dedup_audit.py`): 0 cross-boundary
      duplicates, max test→train Jaccard 0.208 — provably leak-free.
- [x] **B6 — Train-side generation + augmentation.** Tooling done 2026-07-15
      (S1 `generate.mjs --timbre-coverage`, S2 `scripts/dataset/augment_audio.py`,
      S3 bank rotation — all verified: 7 waveforms spread, onsets within
      ±50 ms, banks rotate); codex backend wired in `enhance_samples.py`
      (optional). Executed 2026-07-17 locally: batch_1 500 sketches → 424
      usable; **full strudel set rebuilt = 1,022 songs (929 train / 45 val /
      48 test) + 929 S2 aug train entries (1,858 train)**; onset alignment
      median +0.4 ms; split checks PASS (0 leak); drum-alias label bug fixed
      (`kick/sn/…` were labeled Synth Lead 81). ⚠️ test split = 48 songs —
      wide error bars in B8.
- [x] **B7 — Fine-tune v2.** Done 2026-07-22, run `*_20260722-050418`: mix
      strudel .45 / nesmdb .15 / slakh .20 / maestro .10 / egmd .10, LR 3e-5 +
      cosine warmup 1000, 10k steps, bf16, **two seeds 42 + 1337** (via
      `pl.seed_everything`; ~7.5 h each on A100); checkpoints (759 MB
      `last.ckpt` + `metadata.json`) in Drive under
      `checkpoints/YourMT3+_fine_tuned_v2mix_s{42,1337}_20260722-050418/`.
      Pipeline fixes merged en route (PR #4 + final 2026-07-22 merge):
      raw-sketch ingestion, S2 aug indexing (train lists only), preset
      sentinel replacement, NES-MDB rebuild. Strategy deep-think (still
      partially unexecuted — WiSE-FT, codegen ladder):
      [finetune_strategy_B7.md](finetune_strategy_B7.md).
- [x] **B8 — Benchmark v2.** Done 2026-07-23 (also in README). Note-level F1,
      base → v2mix_s42 / v2mix_s1337:

      | benchmark | multi_f | pooled onset_f |
      |---|---|---|
      | corpus test (48 songs) | 0.207 → **0.462** / 0.460 | 0.373 → 0.334 / 0.309 |
      | synthetic b1 (val-diag, 18) | 0.109 → 0.422 / **0.446** | 0.159 → 0.309 / 0.320 |
      | NES-MDB test (50) | 0.068 → **0.606** / 0.599 | 0.351 → **0.640** / 0.626 |

      Seeds agree within ~0.02 — reproducible. (Base corpus multi_f is 0.207
      on the leak-free 48-song repo-level split, vs 0.521 on the old leaky
      111-file Phase 6 eval.) **Ship decision made 2026-07-24: v2mix_s42 is
      the app's deployment model (strudel50 retired) — executed via Phase 7
      A1b.** Remaining eval work:
      - [ ] External real-EDM eval (hand-labeled clips; A6 opt-in uploads
            feed this).
      - [ ] Program confusion matrix, drums-excluded multi_f, per-class event
            counts.

---

## Milestones
1. ✅ **M1 — Infra:** Colab mounts Drive; repo skeleton; Drive layout exists. (Ph 0)
2. ✅ **M2 — Analysis:** distributions of real Strudel sounds plotted & reviewed. (Ph 1)
3. ✅ **M3 — Labels:** pattern → MIDI/events working & verified. (Ph 2)
4. ✅ **M4 — Audio:** scalable WAV render validated (offline). (Ph 3)
5. ✅ **M5 — Dataset:** strudel + EGMD + MAESTRO + Slakh assembled in Drive in
   YourMT3 format (49.6k songs / 767 h). (Ph 4–5)
6. ✅ **M6 — Fine-tune:** strudel50 beats base on every Strudel category
   (Synth Lead 0.00→0.52, drums 0.53→0.84); benchmark + critique documented. (Ph 6)
7. 🔥 **M7 — App:** a real mp3 interval converts end-to-end to playable Strudel
   code in the deployed app (upload → RunPod → codegen → embedded REPL). (Ph 7)
8. 🎯 **M8 — Model v2:** a checkpoint beats strudel50 on the *external* real-
   electronic eval without worse forgetting, and ships in the app. (Ph 8)
   *Progress: v2mix (2 seeds) trained + benchmarked — corpus multi_f
   0.207→0.46, NES-MDB 0.068→0.61; external eval + ship remain.*

## Open questions / risks
- [x] SuperDough on `node-web-audio-api` — **resolved**: Phase 3 spike passed;
      `render_offline.mjs` renders synths + sample banks (AudioWorklet FX gap
      remains, see Phase 3).
- [x] Corpus size — do we also scrape strudel.cc / forums? **Resolved by B2
      (2026-07-15): the public supply is saturated; growth comes from
      generation (B6) and app uploads (A6), not scraping.**
- [x] Node-in-Colab ergonomics — **resolved in practice** across notebooks 00–06
      (apt/nvm Node install from Python cells, subprocess orchestration).
- [ ] How much timbre/FX to encode as labels vs. notes-only (affects events JSON).
      *(Phase 6 trained notes-only; synth params are dumped by the labeler but
      unused — revisit if codegen (Phase 7 A2) wants them.)*
- [x] Licensing of fetched corpus songs — **settled**: analysis-only; GPL repos
      referenced as shallow submodules, never vendored or redistributed.
- [x] Fine-tune integration risk — **resolved**: checkpoint loads and resumes
      cleanly; our labels matched the event-token format (Phase 6 completed).
