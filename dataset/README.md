# `dataset/` — generated training songs

> **Track B B1 (2026-07-15): the generated set was purged and is not yet
> regenerated.** The previous batches (`batches/`, `enhanced_all.yaml`,
> `sketches_all.yaml`) were sampled from distributions computed over the **full**
> corpus — including files that later became the held-out test set — so they were
> **leak-tainted**. They will be regenerated **train-side only** in Track B B6,
> *after* the repo-level train/test split (B5). The layout below describes what
> B6 will recreate. The generator code (`data_gen/generate.mjs`,
> `enhance_samples.py`, `collate_enhanced.py`) is unchanged. The **real corpus**
> under `corpus/github/*` was untouched.
>
> Drive-side renders + YourMT3 index entries for the purged songs are cleaned up
> by `scripts/dataset/purge_generated_drive.sh` (dry-run by default).

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
  REPL track (LLM subagents), validated against the real engine
  (`data_gen/extract_labels.mjs`, 4 ≤ events ≤ 2000).
- **`enhanced.yaml`** — `data_gen/collate_enhanced.py --batch <N>` re-validates the
  `.js` files and collates the passing ones (with lineage: `source_id`, `source_seed`).
- **`enhanced_all.yaml` / `sketches_all.yaml`** — rebuilt by
  `data_gen/collate_enhanced.py --all`. `scripts/dataset/preprocess_strudel.py` and
  the notebooks read `enhanced_all.yaml` (which tolerates the file being absent
  post-purge — it simply contributes 0 songs until B6).

## Adding a batch (B6 regeneration — train-side sources only)

```bash
node data_gen/generate.mjs --n 500 --seed <seed> --temp 0.2 \
     --yaml dataset/batches/batch_<N>/sketches.yaml
# enhance the 500 sketches -> dataset/batches/batch_<N>/enhanced/<id>.js (subagents)
python data_gen/collate_enhanced.py --batch <N>   # collate + refresh *_all.yaml
```

**B6 constraint:** generation must sample only from the **train-side** corpus
distributions (recomputed in B5 after the repo-level split), never the full
corpus. See `docs/roadmap.md` Phase 8.

## Rendered artifacts (audio/MIDI/events)

`scripts/dataset/preprocess_strudel.py` turns these songs into the aligned
**(audio WAV, MIDI/events, Strudel code)** triples used for fine-tuning. Small
symbolic artifacts (MIDI, events, manifest) live in git; the GB-scale 16 kHz WAV
audio is stored in Google Drive and kept out of git.
