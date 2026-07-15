# Repository-level split (Track B B5) — frozen

Replaces the old **file-level hash split** (the critique's #3 leakage finding)
with a **leave-repositories-out** split: whole repos are held out as the test
set, so near-duplicate patterns within a repo can't straddle the boundary and
generation never sees a test author. Frozen 2026-07-15.

## The split

**TEST (held out — 124 patterns, 2 distinct authors, real songs):**
- `strudel-songs-collection` (eefano) — 91 standalone `.js` songs, the richest
  real-song source.
- `strudel_trance` (honcoops) — trance / electronic (on-domain for our goal).

**TRAIN (731 patterns, 6 sources):** `strudel-coding-music`, `uzu-strudel`,
`strudel-sampler-mixes`, `strudelplay`, `strudel-using-local-samples`,
`strudel-mcp-server`.

Single source of truth: `TEST_REPOS` in `scripts/dataset/preprocess_strudel.py`
and `notebooks/01_strudel_corpus_analysis.ipynb`, mirrored by `split_role:` in
`corpus/sources.yaml`.

## Why these repos

Real per-source pattern counts (extracted with the pipeline's own logic over all
8 checked-out submodules; total 855 unique):

| source | patterns | % | standalone songs | split |
|---|---:|---:|---:|---|
| strudel-coding-music | 596 | 69.7 | 1 | train |
| strudel-songs-collection | 91 | 10.6 | 91 | **test** |
| strudel-sampler-mixes | 52 | 6.1 | 5 | train |
| uzu-strudel | 45 | 5.3 | 0 | train |
| strudel_trance | 33 | 3.9 | 6 | **test** |
| strudel-mcp-server | 18 | 2.1 | 2 | train |
| strudelplay | 16 | 1.9 | 1 | train |
| strudel-using-local-samples | 4 | 0.5 | 0 | train |

Three constraints drove the choice:
1. **No fork can straddle the boundary.** `strudel-coding-music` (a Strudel-repo
   fork, 70% of the corpus) and `uzu-strudel` (the upstream repo) both carry the
   same official `tunes.mjs`. They MUST sit together (train) or the official
   tunes would leak train↔test. That also forces the 70% fork into train
   (can't hold out 70%).
2. **Test = real songs from held-out authors.** The two test repos are actual
   standalone songs from authors (eefano, honcoops) absent from training — a far
   better eval than the old hash split, whose 158 "test" items were ~75%
   drum-machine definitions and doc snippets from the fork.
3. **Test is electronic-leaning** (trance + a varied song collection),
   matching the transcription target.

Test fraction 14.5% — smaller than the old 20%, but *clean and higher-quality*.

## Leakage audit (verification)

`scripts/dataset/dedup_audit.py` brute-forces character-5-gram Jaccard between
every test pattern and every train pattern (`analysis/results/dedup_audit.json`):

- **exact cross-boundary duplicates: 0**
- **near-dupes (Jaccard ≥ 0.8): 0**
- **max test→train Jaccard: 0.208**

The held-out repos are genuinely distinct — the split is leak-free, which the
file-level hash split could not guarantee (same-repo near-duplicates routinely
landed on opposite sides).

## What changed

- `notebooks/01_strudel_corpus_analysis.ipynb` — `corpus_split` is now repo-membership;
  distributions are recomputed **train-side only** (re-run here: 731 train / 124
  test; all 10 `analysis/results/*.json` refreshed, `corpus_test.json` → v2 with
  `test_repos`).
- `scripts/dataset/preprocess_strudel.py` — `collect_corpus` splits by
  `TEST_REPOS`; `strudel_corpus_test.json` records `test_repos` + per-item
  `source`. (Legacy `--test-fraction` ignored.)
- `corpus/sources.yaml` — `split_role: train|test` per source.
- New: `scripts/dataset/dedup_audit.py` + `analysis/results/dedup_audit.json`.

## Downstream (B6)

Generation samples **only** the train-side distributions just recomputed. The
test repos contribute nothing — no patterns, no distributions, no generation
seeds — and stay pristine, un-augmented real corpus for evaluation.
