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

See [../roadmap.md](../roadmap.md). Pure JS so it runs in Node (incl. Colab).
