# Generated-dataset layout (`dataset/`)

Reference for the **synthetic training-song output** the generation pipeline
writes. The `dataset/` directory is **created on demand** by
`data_gen/generate.mjs` (`mkdirSync(..., {recursive:true})`) — it is not a
tracked folder, so it may be absent in a fresh checkout until you generate.

> **State (Track B, 2026-07-17): the leak-tainted pre-B5 batches were purged
> (B1) and the set was regenerated train-side only (B6):** batch_1 = 500
> timbre-coverage sketches → 424 usable, ingested raw (`sketch_*`, no LLM
> step). Generation samples only the B5 train-side distributions; Drive-side
> leftovers of purged songs are cleaned by
> `scripts/dataset/purge_generated_drive.py` (dry-run by default).

## Layout

Synthetic songs are produced in **batches**, one folder per sampling run, so the
set scales uniformly. Each batch is self-contained; the dataset-level
`*_all.yaml` files aggregate every batch and are what downstream consumers read.

```
dataset/
  batches/
    batch_<N>/
      sketches.yaml        raw sampled sketches   (data_gen/generate.mjs)
      enhanced/<id>.js     one validated enhanced track per sketch (LLM)
      enhanced.yaml        collated enhanced songs for this batch
  enhanced_all.yaml        every batch's enhanced songs — consumer entry point
  sketches_all.yaml        every batch's raw sketches
```

- **`sketches.yaml`** — output of `data_gen/generate.mjs --seed <s> --yaml …`.
  Song ids are `<seed>_<i>`; base seeds are spaced ≥500 apart so batches never
  overlap (batch_1 seed 1, then 1000/2000/3000/4000, …).
- **`enhanced/<id>.js`** — each rough sketch rewritten into one coherent Strudel
  REPL track by an LLM (`enhance_samples.py`, backend `--model codex` for Track
  B), validated against the real engine (`data_gen/extract_labels.mjs`,
  4 ≤ events ≤ 2000).
- **`enhanced.yaml`** — `data_gen/collate_enhanced.py --batch <N>` re-validates
  the `.js` files and collates the passing ones (lineage: `source_id`,
  `source_seed`).
- **`enhanced_all.yaml` / `sketches_all.yaml`** — rebuilt by
  `collate_enhanced.py --all`. `scripts/dataset/preprocess_strudel.py` and the
  notebooks read `enhanced_all.yaml` (which tolerates the file being absent
  post-purge — it simply contributes 0 songs until B6).

## Generating a batch (B6 — train-side sources only)

```bash
# 1. sample sketches with timbre coverage (S1/S3) — see roadmap Phase 8 B6
node data_gen/generate.mjs --n 500 --seed 1 --temp 0.2 --timbre-coverage \
     --yaml dataset/batches/batch_1/sketches.yaml
# 2. (optional, gated) LLM-diversify -> dataset/batches/batch_1/enhanced/<id>.js
python data_gen/enhance_samples.py --batch 1 --model codex
python data_gen/collate_enhanced.py --batch 1     # collate + refresh *_all.yaml
```

**B6 constraint:** generation samples only the **train-side** corpus
distributions (recomputed in B5 after the repo-level split), never the full
corpus. See [roadmap.md](roadmap.md) Phase 8 (B5/B6).

## Rendered artifacts (audio/MIDI/events)

`scripts/dataset/preprocess_strudel.py` turns these songs into the aligned
**(audio WAV, MIDI/events, Strudel code)** triples used for fine-tuning. Small
symbolic artifacts (MIDI, events) live in git; the GB-scale 16 kHz WAV audio is
stored in Google Drive (`DATA_HOME=…/restrudel/datasets`) and kept out of git.
Post-render, `scripts/dataset/augment_audio.py` (S2) adds time-preserving
augmented variants.
