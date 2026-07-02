# data_gen

Node tooling that turns Strudel pattern strings into training samples.

- **Generation (Phase 4): `generate.mjs`** — synthesizes new Strudel code by
  sampling the corpus distributions in `analysis/results/`:
  P(head) → P(content | function) → P(next | current) until `__END__`, voices
  from the corpus polyphony stats. Seeded (reproducible).

  ```bash
  node data_gen/generate.mjs --n 10 --seed 42            # print to stdout
  node data_gen/generate.mjs --n 500 --seed 1 --out tmp/ # write {seed}_{i}.js
  ```

- **Labels (Part A):** evaluate a pattern → `queryArc` → haps → MIDI/events JSON.
  Deterministic, exact, no audio. *(Phase 2 — next; also the validity gate for
  generated code)*
- **Audio (Part B):** render the same pattern → WAV via `OfflineAudioContext`
  (faster-than-realtime); headless-browser fallback. *(Phase 3)*

See [../roadmap.md](../roadmap.md). Pure JS so it runs in Node (incl. Colab).
