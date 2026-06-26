# Restrudel — Roadmap (Draft v1)

Step-by-step workflow. **Scope of this document: Goal 1 — gather and create the
training data.** Later goals (train the AMT model, build the MIDI→Strudel stage,
end-to-end demo) are tracked in [project_plan.md](project_plan.md) and will get
their own roadmap once data exists.

## Guiding principles
- **Data-driven, not random.** We do *not* generate uniform-random notes. We
  first measure which **sounds/synths/effects real Strudel songs actually use**,
  then weight synthetic generation toward that real distribution.
- **Scalable by default.** Prefer faster-than-realtime, batch-friendly tooling.
- **Aligned triples.** Every sample is produced from one source pattern string,
  yielding perfectly-aligned **(audio WAV, MIDI/events, Strudel code)**.
- **Large data off this machine — but only the large data.** Code, the fetched
  corpus (~MB of `.js`), analysis plots, and MIDI/events are small → they live in
  **git**. Only the **GB-scale WAV audio** goes to **Google Drive**, pushed with
  **`rclone`** (no full local copy, no browser). This avoids Drive/Colab auth for
  all early work.

## Environment decisions (locked)
- **Compute (Phase 1–2):** run **locally** (Node + Python), artifacts committed to
  the repo. No Drive, no Colab needed yet.
- **Compute (Phase 3–4, heavy):** local or a VM; Colab optional. The authored
  `notebooks/00_setup.ipynb` (Drive mount + Node) is kept for that stage.
- **Storage:** git for code + small artifacts (corpus, analysis, MIDI);
  **`rclone` → Google Drive** for the WAV dataset only.
- **Audio render (Part B):** `OfflineAudioContext` (faster-than-realtime) first;
  headless browser as proven fallback. Validated by a spike before we depend on it.

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
- [ ] **Drive layout** (heavy audio only, via `rclone`, set up in Phase 3):
  ```
  Restrudel/audio/{id}.wav   # 16 kHz mono renders; referenced by manifest.jsonl
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

---

## Milestones (Goal 1)
1. **M1 — Infra:** Colab mounts Drive; repo skeleton; Drive layout exists. (Ph 0)
2. **M2 — Analysis:** distributions of real Strudel sounds plotted & reviewed. (Ph 1) ⭐
3. **M3 — Labels:** pattern → MIDI/events working & verified. (Ph 2)
4. **M4 — Audio:** scalable WAV render validated (offline or fallback). (Ph 3)
5. **M5 — Dataset:** first weighted batch of aligned triples in Drive. (Ph 4–5)

## Open questions / risks
- [ ] SuperDough on `node-web-audio-api` — unproven (Phase 3 spike de-risks).
- [ ] Corpus size (~100s of songs) may be small for robust distributions — do we
      also scrape strudel.cc shared links / forums?
- [ ] Node-in-Colab ergonomics (installing/running Node from a Python notebook).
- [ ] How much timbre/FX to encode as labels vs. notes-only (affects events JSON).
- [ ] Licensing of fetched corpus songs — for analysis only vs. redistribution.
