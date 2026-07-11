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

> **🔥 Current priority: build the YourMT3+ fine-tuning corpus (Phase 5).**
> Phases 1–4 have landed — corpus **train/test split**, distribution **analysis**,
> distribution-**sampled generation** (500), and **LLM enhancement** (500 inspired)
> are all done, and `scripts/dataset/preprocess_strudel.py` already renders the
> Strudel data into YourMT3+'s exact training format. Now:
> 1. **Extend with labeled electronic audio** — Lakh electronic subset + EGMD
>    (real WAV↔MIDI pairs) — plus MAESTRO/Slakh as forgetting-mitigation sets.
> 2. **Run the whole fetch/render in Colab writing straight to a Drive-mounted
>    store** (`DATA_HOME` under `MyDrive/restrudel/datasets`), so nothing large
>    ever lands on this server or a local disk.
> 3. **EDA** of the assembled categories (electronic vs. Strudel-generated vs.
>    Strudel-corpus) in `notebooks/04_finetune_data.ipynb`.

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
- [ ] **Heavy audio → Google Drive:** decide the sync mechanism (DVC was set up
      then removed as unused). `dataset/audio/` (16 kHz mono WAV renders) lives in
      Drive; git keeps only the small artifacts. Drive layout:
  ```
  <drive_folder>/...        # 16 kHz mono WAV renders
  ```
- [ ] Decide reproducibility basics: pin Strudel package versions, seed RNG.

## Phase 1 — Corpus collection & sound analysis  ⭐ (do this first)
**Outcome:** ranked distributions of which sounds/synths/effects real Strudel
songs use — the evidence that drives generation.

- [x] **Fetch all available Strudel songs** into `corpus/github/` (9 repos +
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
  corpus/github/*  ──────▶  01_corpus_analysis.ipynb ──▶  sample new Strudel code
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

**(2) Analysis — already built.** `notebooks/01_corpus_analysis.ipynb` distills
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
       corpus stats (`notebooks/02_generated_vs_corpus.ipynb`).

## Phase 5 — Fine-tuning corpus (Goal 1 output) 🔥 (CURRENT PRIORITY)
**Outcome:** a training-ready dataset in **YourMT3+'s exact load format** (16 kHz
mono WAV + `Note`/`NoteEvent` `.npy` + `yourmt3_indexes/*_file_list.json`),
assembled **in Colab straight into a Drive-mounted store** — no heavy data on this
server or a local disk. Built by `scripts/dataset/` (see its README).

### Execution model (decided)
- Colab mounts Drive; `DATA_HOME = /content/drive/MyDrive/restrudel/datasets`.
  Downloads/extracts use the VM's fast ephemeral disk, then move into Drive.
- Orchestrated by `notebooks/04_finetune_data.ipynb` (download → format → EDA →
  split-integrity checks). 5 TB of Drive means every reference set fits.

### The data categories
- [x] **Strudel — generated (synthetic, target domain).** 500 sampled + 500
      LLM-enhanced tracks rendered to aligned WAV/MIDI by `preprocess_strudel.py`.
- [x] **Strudel — corpus (real, target domain).** Train-pool (697) → train/val;
      **held-out 20% (158) → the Strudel TEST set** (deterministic hash split,
      `analysis/results/corpus_test.json`; never rendered into train/val).
- [ ] **Electronic — external, labeled (the extension).** `prepare_lakh.py`
      filters the Lakh MIDI electronic subset (drums + ≥50% synth/electric
      programs) → labels now; **real audio via Surge XT / Vital / Dexed rendering
      still to wire up** (placeholder audio for now, kept out of the loaders).
      Add **EGMD** (electronic drums) as real WAV↔MIDI via `install_reference_sets.py`.
- [ ] **Acoustic — forgetting-mitigation reference sets.** MAESTRO (piano) +
      Slakh (band mixes) from YourMT3's hosted 16 kHz archives; mix ~20–50% into
      batches so the model keeps its existing pitched/real-audio ability.

### Remaining work
- [ ] Run the Colab download of EGMD/MAESTRO/Slakh into Drive (§2 of notebook 04).
- [ ] **Real synth audio for the Lakh electronic subset** (Surge/Vital/Dexed) —
      the highest-leverage way to add labeled electronic timbres beyond Strudel.
- [ ] Per-voice stems for YourMT3's cross-stem mixing augmentation (render each
      `$:`/`stack` voice separately).
- [ ] Reserve a tiny **real** eval set (hand-labeled real electronic clips) — the
      honest generalization test alongside the Strudel holdout.
- [x] **EDA of the assembled categories** in notebook 04 §7 (electronic vs.
      Strudel-generated vs. Strudel-corpus; songs/hours per split).
- [ ] Register a `"strudel"` preset in YourMT3's `amt/src/config/data_presets.py`
      pointing at these file lists when the fine-tune run is set up.

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
1. ✅ **M1 — Infra:** Colab mounts Drive; repo skeleton; Drive layout exists. (Ph 0)
2. ✅ **M2 — Analysis:** distributions of real Strudel sounds plotted & reviewed. (Ph 1)
3. ✅ **M3 — Labels:** pattern → MIDI/events working & verified. (Ph 2)
4. ✅ **M4 — Audio:** scalable WAV render validated (offline). (Ph 3)
5. 🔥 **M5 — Dataset:** Strudel data (500 sampled + 500 enhanced + corpus split)
   packaged in YourMT3 format; **now extend with electronic (Lakh/EGMD) + reference
   sets, assembled in Colab→Drive**; categories reviewed in the EDA. (Ph 4–5)
6. 🎯 **M6 — Fine-tune:** YourMT3+ beats its own baseline on electronic clips. (Ph 6)

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
