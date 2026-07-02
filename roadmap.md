# Restrudel — Roadmap (Draft v1)

Step-by-step workflow for the **current master plan**:
1. **Generate synthetic training data** — aligned (audio WAV, MIDI/events, Strudel
   code) triples — and store the heavy audio on **Google Drive**.
2. **Fine-tune the existing YourMT3+ checkpoint** on it to improve transcription of
   synth/electronic timbres.

Phases 0–5 build the data (**Goal 1**); Phase 6 does the fine-tune (**Goal 2**).
The later MIDI→Strudel stage and end-to-end demo remain in
[project_plan.md](project_plan.md) until this works. **AWS is out of scope for now**
(a possible scale fallback later, not the plan).

## Guiding principles
- **Data-driven, not random.** We do *not* generate uniform-random notes. We
  first measure which **sounds/synths/effects real Strudel songs actually use**,
  then weight synthetic generation toward that real distribution.
- **Scalable by default.** Prefer faster-than-realtime, batch-friendly tooling.
- **Aligned triples.** Every sample is produced from one source pattern string,
  yielding perfectly-aligned **(audio WAV, MIDI/events, Strudel code)**.
- **Large data off this machine — but only the large data.** Code, the fetched
  corpus (~MB of `.js`), analysis plots, and MIDI/events are small → they live in
  **git**. Only the **GB-scale WAV audio** goes to **Google Drive**, versioned
  with **DVC** (only tiny `.dvc` pointers are committed; the audio state is pinned
  to the git commit). Setup + workflow: [docs/dvc.md](docs/dvc.md).

## Environment decisions (locked)
- **Compute (Phase 1–2):** run **locally** (Node + Python), artifacts committed to
  the repo. No Drive, no Colab needed yet.
- **Compute (Phase 3–4, heavy):** local or a VM; Colab optional. The authored
  `notebooks/00_setup.ipynb` (Drive mount + Node) is kept for that stage.
- **Storage:** git for code + small artifacts (corpus, analysis, MIDI);
  **DVC → Google Drive** for the WAV dataset only ([docs/dvc.md](docs/dvc.md)).
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
- [ ] **Repo layout** (small artifacts, in git):
  ```
  corpus/            # raw fetched Strudel .js songs (Phase 1)
  analysis/out/      # distribution tables + plots (Phase 1)
  dataset/
    midi/{id}.mid
    events/{id}.json # haps + synth params used
    code/{id}.js     # the source pattern
    manifest.jsonl   # one row per sample → all artifacts + params + split
  ```
- [x] **DVC → Drive** for heavy audio: `dvc init` done, `scripts/setup_dvc_remote.sh`
      + [docs/dvc.md](docs/dvc.md) added. `dataset/audio/` is DVC-tracked; the WAVs
      land in Drive and only `dataset/audio.dvc` is committed. Drive layout:
  ```
  <drive_folder>/...        # DVC-managed content (16 kHz mono WAV renders)
  ```
- [ ] Decide reproducibility basics: pin Strudel package versions, seed RNG.

## Phase 1 — Corpus collection & sound analysis  ⭐ (do this first)
**Outcome:** ranked distributions of which sounds/synths/effects real Strudel
songs use — the evidence that drives generation.

- [x] **Fetch all available Strudel songs** into `corpus/sources/` (9 repos +
      Codeberg monorepo docs; ~100 MB, < 2 GB budget). → 855 unique snippets.
- [x] **Parse** each file and extract usage of (`notebooks/01_corpus_analysis.ipynb`):
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

## Phase 2 — Label pipeline (Part A: pattern → MIDI/events)
**Outcome:** deterministic, exact labels from any pattern string — no audio needed.

- [ ] Node script `data_gen/labels.mjs`: evaluate pattern (`@strudel/transpiler`
      + `@strudel/mini`) → `pattern.queryArc(0, cycles)` → haps.
- [ ] Convert haps → MIDI (`@tonejs/midi`): cycle→seconds via `cps`, pitch from
      `note`/`n`, duration from `whole`, velocity from `gain`.
- [ ] Also dump raw haps + synth params → `events/{id}.json`.
- [ ] Unit-check: round-trip a known pattern, assert note count/timing.
- [ ] Pin Strudel version (eval import surface varies across versions).

## Phase 3 — Audio renderer (Part B: pattern → WAV), scalable
**Outcome:** batch WAV rendering, faster-than-realtime, aligned with Phase 2 labels.

- [ ] **Spike:** run SuperDough under `node-web-audio-api` + `OfflineAudioContext`;
      render one known pattern; verify it sounds correct vs strudel.cc.
- [ ] If spike passes → `data_gen/render.mjs` batch renderer (offline, parallel).
- [ ] If spike fails → fallback `render_browser.mjs` (Puppeteer drives a local
      `@strudel/web` page + WAV export); accept near-real-time.
- [ ] Render from the **same pattern string** used for labels (guarantees alignment).
- [ ] Standardize output: 16 kHz mono WAV (matches AMT front end in project_plan).

## Phase 4 — Synthetic data generation (distribution-weighted)
**Outcome:** the actual training corpus of aligned triples, in Drive.

- [ ] Parametric templates in `data_gen/templates/`: bassline, arp, chord stab,
      lead, drum loop, pad.
- [ ] **Weight randomization by Phase 1 distributions** (sound choice, effect use,
      tempo, polyphony) — not uniform. Add controlled timbral diversity
      (oscillator, `lpf`/resonance, ADSR, FX) for coverage YourMT3+ lacks.
- [ ] Orchestrate in `notebooks/10_generate.ipynb`: for each sample → pattern
      string → (labels + audio) → write all artifacts to Drive + append manifest.
- [ ] Start with a small batch (e.g. 500) → sanity-check audio/MIDI alignment →
      scale up.

## Phase 5 — Dataset packaging
**Outcome:** training-ready dataset.

- [ ] Train/val/test splits in `manifest.jsonl`; hold out some templates/timbres
      for generalization testing.
- [ ] Reserve a tiny **real** eval set (hand-labeled real electronic clips).
- [ ] Document format so the AMT stage can consume it directly.

## Phase 6 — Fine-tune YourMT3+ (Goal 2)
**Outcome:** a YourMT3+ checkpoint that beats the released baseline on synth/
electronic timbres.

*Why fine-tune, not train from scratch:* the paper trained on **2× A100 for 300K
steps** across 10 datasets, but the model is **small (~60M params, <2.5% over MT3)**.
Fine-tuning the released checkpoint on our synth data tests the thesis in
**hours of GPU, not days**, and our dataset (≤2 GB) + this model fit one GPU.

- [ ] Get the released checkpoint + training code (`mimbres/YourMT3`); run its
      inference on a few of our electronic clips to fix the **baseline to beat**.
- [ ] Adapt our dataset to YourMT3+'s I/O: 16 kHz audio → its spectrogram front-end;
      our MIDI/events → its MIDI-like event-token targets (`MT3_FULL_PLUS` vocab).
      Reuse the Phase 2 labels.
- [ ] Fine-tune on **Colab** (mount Drive, pull dataset): short run (≪300K steps),
      1 GPU, bf16; checkpoint back to Drive.
- [ ] Evaluate note-level F1 (onset / onset+offset / multi-instrument) on the held-out
      **real** electronic set vs. baseline — the number that proves the thesis.
- [ ] Escalate to AWS Spot only if Colab session limits become the bottleneck.

---

## Milestones
1. **M1 — Infra:** Colab mounts Drive; repo skeleton; Drive layout exists. (Ph 0)
2. **M2 — Analysis:** distributions of real Strudel sounds plotted & reviewed. (Ph 1) ⭐
3. **M3 — Labels:** pattern → MIDI/events working & verified. (Ph 2)
4. **M4 — Audio:** scalable WAV render validated (offline or fallback). (Ph 3)
5. **M5 — Dataset:** first weighted batch of aligned triples in Drive. (Ph 4–5)
6. **M6 — Fine-tune:** YourMT3+ beats its own baseline on electronic clips. (Ph 6) 🎯

## Open questions / risks
- [ ] SuperDough on `node-web-audio-api` — unproven (Phase 3 spike de-risks).
- [ ] Corpus size (~100s of songs) may be small for robust distributions — do we
      also scrape strudel.cc shared links / forums?
- [ ] Node-in-Colab ergonomics (installing/running Node from a Python notebook).
- [ ] How much timbre/FX to encode as labels vs. notes-only (affects events JSON).
- [ ] Licensing of fetched corpus songs — for analysis only vs. redistribution.
- [ ] Fine-tune (Goal 2): does `mimbres/YourMT3` cleanly support loading its
      checkpoint + resuming training on a new dataset? Matching our labels to its
      exact event-token format is the main integration risk.
