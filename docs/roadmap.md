# Restrudel — Roadmap (Draft v2)

Phases 0–6 (build the data, fine-tune YourMT3+) are **done**: two fine-tuned
variants were trained and fully benchmarked (run `comparison_20260713-222456`);
**strudel50** is the carry-forward model. Results + adversarial critique:
[benchmark_interpretation_20260713.md](benchmark_interpretation_20260713.md).
Headline: corpus-test Synth Lead F1 0.000→0.515, drums 0.53→0.84, multi-instr
0.52→0.84, at the cost of −15 slakh / −11 maestro forgetting.

> **🔥 Current priority: twin tracks (decided 2026-07-14).**
> - **Track A — Application (Phase 7):** full-stack app — React+Vite frontend,
>   Node backend on the personal server, model on **RunPod Serverless**
>   (scale-to-zero GPU VM). User uploads a song, selects an interval, gets
>   editable Strudel code in an embedded REPL. Design:
>   [application_architecture.md](application_architecture.md).
> - **Track B — Model v2 (Phase 8):** shift the model **toward electronic music
>   broadly** (not just Strudel-rendered timbres), in strict order: base-model
>   ground truth (done) → purge leak-tainted synthetic data → grow the corpus
>   (strudel.cc scrape) → hunt external electronic data → rethink the
>   generation strategy → **split by repository** → only then generate → only
>   then fine-tune.
>
> The tracks run in parallel and meet at a versioned model registry: the app
> ships v1 with strudel50 and swaps in Track B checkpoints as they win.

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
category → strudel50 carries forward. Full interpretation + adversarial critique
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
RunPod Serverless GPU worker (scale-to-zero VM, strudel50 checkpoint on a
network volume) · repo layout `app/{frontend,backend,gpu-worker}`.

Work packages, in dependency order:
- [x] **A0 — Contracts & skeleton:** done 2026-07-17 (adapted): the contracts
      live as **code**, not schema files — `app/backend/src/protocol.mjs`
      mirrored by `app/frontend/src/protocol.ts`, exercised end-to-end by the
      backend's ws-smoke test. `app/{backend,frontend}` scaffolded
      (`app/README.md`). docker-compose still open → folded into A6.
- [ ] **A1 — GPU worker:** extract the proven inference path from
      `notebooks/06_benchmark.ipynb` into `app/gpu-worker/` (RunPod
      `handler.py` + Dockerfile); tempo/beat estimation (librosa) lives here
      too; upload strudel50 to a RunPod network volume; deploy; measure
      cold/warm latency. The backend-side adapter interface + contract is
      already stubbed (`app/backend/src/transcribe/runpod.mjs`).
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

> **Decision gate (after A1):** if real-mp3 transcription quality is unusable
> (domain gap), the app pivots to "Strudel-ish input first" demo scope while
> Track B closes the gap — the architecture doesn't change either way.

## Phase 8 — Model v2: shift to electronic music (Track B) 🔥
**Outcome:** a checkpoint that beats strudel50 on **real electronic music**
(not just Strudel-rendered audio), with forgetting no worse, measured on a
trustworthy eval. The shift away from base YourMT3+ stays, but it must
generalize to electronic music broadly. **Strict ordering (decided
2026-07-15): ground truth → data reset → corpus growth → strategy rethink →
split by repository → only then generate → only then train.** Rationale: the
Phase 6 critique showed the split leaked and the synthetic data was generated
from distributions that had seen the test files; regenerating before
re-splitting would just bake the leak in again.

- [x] **B0 — Ground truth: what did the base model train on?** Done
      2026-07-15 → [base_model_training_data.md](base_model_training_data.md).
      Verdict: base *has* Synth Lead/Pad labels (from Slakh, ≈2%/4.5% of
      stems) but its only synth timbres are **~26 static Kontakt sample
      patches** — nothing live-synthesized, and **synth bass was silently
      skipped from Slakh entirely** (explains our Bass 0.000). Its own eval:
      Synth Lead F1 0.82 in-domain → 0.02 on real recordings. Cautionary
      tale for us: few static timbres from one renderer ⇒ the same cliff, one
      renderer over — B2–B6 must maximize timbre/renderer diversity.
- [x] **B1 — Purge the existing generated data.** Done 2026-07-15: removed
      `dataset/batches/` (2009 files), `enhanced_all.yaml`, `sketches_all.yaml`
      from git; `preprocess_strudel.py:collect_inspired` now tolerates the
      missing yaml (corpus-only path still runs); `scripts/dataset/purge_generated_drive.py`
      (dry-run by default) removes the matching Drive renders + drops their
      YourMT3 index entries. Generator *code* and the real corpus are untouched;
      the set is **regenerated train-side only in B6**.
- [x] **B2 — Grow the corpus: scrape strudel.cc.** Done 2026-07-15 —
      **finding: the public supply is saturated.** strudel.cc's built-in
      examples are *already* in-corpus (our `uzu-strudel` + `strudel-coding-music`
      sources carry `website/src/repl/tunes.mjs`), the site has no scrapeable
      public pattern gallery (SPA + Codeberg blocks scrapers), and the wider
      GitHub ecosystem is tooling, not songs. The four new personal repos found
      are each blocked on license (unlicensed) or format (patterns in
      `.html`/`.ts`) — none clears clean-licensed **and** non-trivial **and**
      ingestible, so none was auto-added. Built the durable output instead:
      `corpus/sources.yaml` (pluggable manifest: 8 ingested + 4 candidates with
      blockers), `scripts/corpus/add_sources.sh`, and `docs/corpus_growth_B2.md`.
      **Consequence for B5:** plan the repo split around the existing 8 sources;
      real growth comes from generation (B6) + the app's user uploads (A6), not
      scraping.
- [x] **B3 — Hunt for external labeled electronic music data.** Done
      2026-07-15 → [external_electronic_data_B3.md](external_electronic_data_B3.md)
      (evidence-based survey). Key results: the renderer is **DawDreamer**
      (Python VST3 host, offline, Colab-supported) hosting **Surge XT / Dexed /
      Vital** — *correction to the old plan:* those synths have no offline CLI;
      host them as VST3 in DawDreamer instead. Real work = the **GM-program →
      synth-patch map** (scaffolded in `scripts/dataset/render_synths.py`,
      plugs into `prepare_lakh.py`'s staging→loader promotion). Feed it
      **MetaMIDI/GigaMIDI** genre-tagged electronic MIDI (CC BY 4.0) over
      GM-filtered LMD. Quick independent win: **NES-MDB** (MIT, headless WAV +
      note/timbre labels — real 2A03 electronic). Deprioritized: NSynth
      (auxiliary; static samples recreate the Slakh trap), fluidsynth/SF2
      (sampled baseline), BitMIDI/VGMusic (unlicensed). Fallback stays: scale
      Strudel generation (B6), widening its timbre range per B4.
- [x] **B4 — Rethink the generation/augmentation strategy.** Done 2026-07-15 →
      [augmentation_strategy_B4.md](augmentation_strategy_B4.md). Decision:
      **change the axis we sample on.** For a transcription model the
      generalization axis is **timbre + audio realism**, not symbolic musical
      realism — so:
      - **S1** keep corpus-distribution sampling for *notes/rhythm/functions*,
        but **decouple timbre**: a coverage sampler spans waveform/filter/env/
        FX and *over-samples rare configs* (mirroring the corpus here is exactly
        Slakh's 26-patch trap);
      - **S2** add the missing **audio-domain augmentation** stage (mastering
        chain: gain/EQ/comp/limit/saturation/bitcrush/short-reverb/MP3
        round-trip; strictly time-preserving so labels stay aligned) — cheapest
        + biggest realism gain, also sidesteps the node-web-audio-api FX gap;
      - **S3** drum-bank rotation (breaks 909/808 memorization);
      - structure/mini-notation: **not worth investing** (vary *density* as a
        knob instead); LLM-enhance **repurposed** from "improve music" to
        "diversify timbre/FX" and **gated on an ablation** (optional, not
        critical path). *(codex requested for the LLM step is not installed —
        B6 makes it pluggable `--llm codex|anthropic|none`.)*
- [x] **B5 — Split by SOURCE, then freeze it.** Done 2026-07-15 →
      [repo_split_B5.md](repo_split_B5.md). Leave-repositories-out split, frozen:
      **TEST = strudel-songs-collection (eefano) + strudel_trance (honcoops) =
      124 patterns, real songs, held-out authors**; TRAIN = the other 6 (731
      patterns). The two Strudel forks (strudel-coding-music 70% + uzu-strudel)
      stay together in train so their shared official `tunes.mjs` can't leak.
      Single source of truth: `TEST_REPOS` in `preprocess_strudel.py` +
      notebook 01, mirrored by `split_role` in `corpus/sources.yaml` (replaces
      the drift-prone duplicated hash formula). **Recomputed distributions
      train-side only** (ran notebook 01 headlessly → 731/124, all 10
      `analysis/results/*.json` refreshed, `corpus_test.json` v2). **Dedup
      audit** (`dedup_audit.py`): 0 cross-boundary duplicates, max test→train
      Jaccard 0.208 → provably leak-free (the old hash split couldn't guarantee
      this).
- [x] **B6 — Only then: generate/augment the TRAINING set.** Done 2026-07-15 →
      [generation_B6.md](generation_B6.md). Tooling built + verified locally,
      train-side only (reads the B5 train-side distributions; test repos never
      enter generation):
      - **S1** `generate.mjs --timbre-coverage` — decouples timbre from the
        corpus dist: FX/filter/env params span their range (10% extremes),
        synth voices get a uniformly-chosen waveform (breaks sawtooth
        dominance). Verified: 7 waveforms spread, lpf spans 111–1859+.
      - **S2** `scripts/dataset/augment_audio.py` — strictly time-preserving
        mastering-chain augmentation (gain/EQ/sat/comp/bitcrush/decimate/short-
        reverb/limit). Verified: length preserved, onsets within ±50 ms, variants
        differ meaningfully — labels stay aligned.
      - **S3** drum-bank rotation (8 machines) — breaks 909/808 memorization.
      Deferred to the Colab run (needs the Strudel engine + render + Drive): the
      validity gate at scale, render/index, augment; the LLM-enhance step is
      gated/optional and now **wired to codex** (`enhance_samples.py --model
      codex`, demonstrated end-to-end). No unvalidated
      batch committed (respects B1's purge). Full run recipe + B8 ablations in
      the doc. Test set stays untouched raw corpus.
- [ ] **B7 — Only then: fine-tune v2.** LR 3e-5 + warmup, 10–20k steps,
      strudel50-style mix rebalanced toward the new electronic data (keep
      slakh/maestro replay), **≥2 seeds**; nb05 driver as-is.
      *Config implemented 2026-07-16 (pipeline-fixes branch): nb05 now runs
      LR 3e-5 + cosine warmup, 10k steps, two seeds (42/1337) of ONE mix via
      `pl.seed_everything` (train.py has no seed flag), with nesmdb joining
      the mix automatically once notebook 04 built+rendered it (else the mix
      renormalizes to ~strudel50). Also fixed en route: raw S1 sketches now
      ingest directly (`sketch_*`, LLM step truly optional), S2 aug variants
      are indexed as train entries (train list only, test refused), preset
      registration replaces stale sentinel blocks instead of skipping, and
      NES-MDB was rebuilt against the verified release (official in-tarball
      split, noise→GM drums, synth-bass labels, VGM+vgm2wav render path —
      the py2-only `nesmdb` package is out).*
- [ ] **B8 — Benchmark v2 + decision gate.** nb06 plus: external
      real-electronic eval set (hand-labeled clips; app opt-in uploads from
      A6 feed this), confusion matrix of predicted programs (settles the
      exact-0.000 question for good), drums-excluded multi-instrument F1 +
      per-class event counts. The new checkpoint replaces strudel50 in the
      app (`model_version`) only if it wins on the external eval without
      worse forgetting.

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

## Open questions / risks
- [x] SuperDough on `node-web-audio-api` — **resolved**: Phase 3 spike passed;
      `render_offline.mjs` renders synths + sample banks (AudioWorklet FX gap
      remains, see Phase 3).
- [ ] Corpus size (~100s of songs) may be small for robust distributions — do we
      also scrape strudel.cc shared links / forums? *(Also relevant to Phase 8
      repo-held-out split: more repos = better splits.)*
- [x] Node-in-Colab ergonomics — **resolved in practice** across notebooks 00–06
      (apt/nvm Node install from Python cells, subprocess orchestration).
- [ ] How much timbre/FX to encode as labels vs. notes-only (affects events JSON).
      *(Phase 6 trained notes-only; synth params are dumped by the labeler but
      unused — revisit if codegen (Phase 7 A2) wants them.)*
- [x] Licensing of fetched corpus songs — **settled**: analysis-only; GPL repos
      referenced as shallow submodules, never vendored or redistributed.
- [x] Fine-tune integration risk — **resolved**: checkpoint loads and resumes
      cleanly; our labels matched the event-token format (Phase 6 completed).
