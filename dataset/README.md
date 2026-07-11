# `dataset/` — generated training songs

Synthetic Strudel songs are produced in **batches**, one folder per sampling run,
so the set scales uniformly as more songs are generated. Each batch is
self-contained; the dataset-level `*_all.yaml` files aggregate every batch and are
what downstream consumers read.

## Layout

```
dataset/
  batches/
    batch_<N>/
      sketches.yaml        raw sampled sketches   (data_gen/generate.mjs)
      enhanced/<id>.js     one validated enhanced track per sketch (subagents)
      enhanced.yaml        collated enhanced songs for this batch
  enhanced_all.yaml        every batch's enhanced songs — consumer entry point
  sketches_all.yaml        every batch's raw sketches
```

- **`sketches.yaml`** — output of `data_gen/generate.mjs --seed <s> --yaml …`. Song
  ids are `<seed>_<i>`; base seeds are spaced ≥500 apart so batches never overlap
  (batch_1 seed 1, then 1000/2000/3000/4000, …).
- **`enhanced/<id>.js`** — each rough sketch rewritten into one coherent Strudel
  REPL track (Sonnet subagents), validated against the real engine
  (`data_gen/extract_labels.mjs`, 4 ≤ events ≤ 2000).
- **`enhanced.yaml`** — `data_gen/collate_enhanced.py --batch <N>` re-validates the
  `.js` files and collates the passing ones (with lineage: `source_id`, `source_seed`).
- **`enhanced_all.yaml` / `sketches_all.yaml`** — rebuilt by
  `data_gen/collate_enhanced.py --all`. `scripts/dataset/preprocess_strudel.py` and
  the notebooks read `enhanced_all.yaml`.

## Adding a batch

```bash
node data_gen/generate.mjs --n 500 --seed <seed> --temp 0.2 \
     --yaml dataset/batches/batch_<N>/sketches.yaml
# enhance the 500 sketches -> dataset/batches/batch_<N>/enhanced/<id>.js (subagents)
python data_gen/collate_enhanced.py --batch <N>   # collate + refresh *_all.yaml
```

## Rendered artifacts (audio/MIDI/events)

`scripts/dataset/preprocess_strudel.py` turns these songs into the aligned
**(audio WAV, MIDI/events, Strudel code)** triples used for fine-tuning. Small
symbolic artifacts (MIDI, events, manifest) live in git; the GB-scale 16 kHz WAV
audio is stored in Google Drive and kept out of git (sync mechanism TBD).
