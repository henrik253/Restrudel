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
  node data_gen/generate.mjs --n 500 --seed 1 --json out.json      # one JSON file
  node data_gen/generate.mjs --n 10 --temp 0.5                     # more volatile content
  ```
  `--json` writes `{ generator, params, count, songs:[{id, seed, voices, code}] }`
  where each `code` is an **array of lines** (real newlines in the file, not `\n`).

- **Labels (Part A):** evaluate a pattern → `queryArc` → haps → MIDI/events JSON.
  Deterministic, exact, no audio. *(Phase 2 — next; also the validity gate for
  generated code)*
- **Audio (Part B):** render the same pattern → WAV via `OfflineAudioContext`
  (faster-than-realtime); headless-browser fallback. *(Phase 3)*

See [../roadmap.md](../roadmap.md). Pure JS so it runs in Node (incl. Colab).
