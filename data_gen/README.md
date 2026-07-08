# data_gen

Node tooling that turns Strudel pattern strings into training samples.

- **Generation (Phase 4): `generate.mjs`** — synthesizes new Strudel code by
  sampling the corpus distributions in `analysis/results/`: function chains via
  P(head) → P(next | current) until `__END__`; call **content** via numeric/
  categorical stats (`arguments.json`) and, for note/sample sequences, a
  **variable-order back-off token Markov model** with temperature
  (`content_models.json`). Voices from corpus polyphony. Seeded (reproducible).

  ```bash
  node data_gen/generate.mjs --n 10 --seed 42                       # print to stdout
  node data_gen/generate.mjs --n 500 --seed 1 --out tmp/           # {seed}_{i}.js files
  node data_gen/generate.mjs --n 500 --seed 1 --yaml out.yaml      # one YAML file
  node data_gen/generate.mjs --n 10 --temp 0.5                     # more volatile content
  node data_gen/generate.mjs --n 10 --min-voices 3 --max-voices 5 --min-len 4  # denser/longer
  ```
  **Hyperparameters** (all optional, recorded in the YAML `params`):
  `--temp` (content volatility), `--min-voices`/`--max-voices` (voices per song),
  `--min-len`/`--max-len` (tokens per note/sample sequence). `--min-len 2` (the
  default) avoids the "single sound that just repeats" songs; raise the voice/len
  floors for richer patterns.

  `--yaml` writes `generator`, `params`, `count`, and `songs: [{id, seed, voices,
  code}]`, where each `code` is a YAML literal block scalar (`|`) — real newlines,
  no quote-escaping, no blank-line placeholders.

  > **Leakage note:** `analysis/results/` is built from only the **80% corpus
  > train-pool** (`notebooks/01_corpus_analysis.ipynb` holds 20% out), so nothing
  > `generate.mjs` samples can encode a held-out test snippet.

- **Enhancement: `enhance_samples.py` + `collate_enhanced.py`** — the raw sampler
  output is incoherent per-voice, so each sketch is rewritten into a coherent,
  musical Strudel REPL track. `enhance_samples.py` is the reproducible LLM path
  (Anthropic SDK if `ANTHROPIC_API_KEY` is set, else a logged-in `claude -p`),
  validating every candidate against the real engine (`extract_labels.mjs`) with
  retry. When no API/login is available, enhancement runs as **subagents** that
  write one validated `dataset/batches/batch_<N>/enhanced/<id>.js` per sketch (see
  the enhancement spec used per batch); `collate_enhanced.py` then re-validates
  those files and assembles that batch's `enhanced.yaml` plus the dataset-level
  `enhanced_all.yaml`. Songs are organised per sampling run — see
  [`../dataset/README.md`](../dataset/README.md).

  ```bash
  node generate.mjs --n 500 --seed 1000 --temp 0.2 \
       --yaml ../dataset/batches/batch_2/sketches.yaml
  python enhance_samples.py --batch 2  # LLM enhance (needs API key or claude login)
  python collate_enhanced.py --batch 2 # enhanced/*.js -> batch enhanced.yaml + *_all.yaml
  ```
  This replaces the old templated `inspire_from_yaml.py` (kept for reference): the
  enhancer keeps each sketch's sound palette and tempo feel instead of emitting a
  fixed random arrangement.

- **Labels (Part A):** evaluate a pattern → `queryArc` → haps → MIDI/events JSON.
  Deterministic, exact, no audio. *(Phase 2 — next; also the validity gate for
  generated code)*
- **Audio (Part B, spike passed): `render_offline.mjs`** — Strudel pattern
  string → WAV with SuperDough driven by `node-web-audio-api`'s
  `OfflineAudioContext`: headless, faster-than-realtime, synths *and* remote
  sample banks (e.g. `.bank("RolandTR909")`). Demo:
  [`../notebooks/03_yourmt3_demo.ipynb`](../notebooks/03_yourmt3_demo.ipynb).

  ```bash
  node render_offline.mjs --code 'note("c2 eb2").s("sawtooth")' --out out.wav
  node render_offline.mjs --file song.js --cycles 8 --sr 16000 --out song.wav
  ```
  Known limits: AudioWorklet FX (`crush`, `distort`, `coarse`, `djf`, …) don't
  load under node-web-audio-api yet (native-node FX like `lpf`/`room`/`delay`
  are fine). Requires `npm install` in `data_gen/` (a `postinstall` hook fixes
  `@kabelsalat/web`'s broken entry point for Node).

See [../docs/roadmap.md](../docs/roadmap.md). Pure JS so it runs in Node (incl. Colab).
