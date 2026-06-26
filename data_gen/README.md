# data_gen

Node tooling that turns Strudel pattern strings into training samples.

- **Labels (Part A):** evaluate a pattern → `queryArc` → haps → MIDI/events JSON.
  Deterministic, exact, no audio. *(Phase 2)*
- **Audio (Part B):** render the same pattern → WAV via `OfflineAudioContext`
  (faster-than-realtime); headless-browser fallback. *(Phase 3)*
- **Generation:** parametric templates weighted by the real-corpus sound
  distribution from `analysis/`. *(Phase 4)*

See [../roadmap.md](../roadmap.md). Pure JS so it runs in Node (incl. Colab).
