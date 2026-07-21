# Handoff: run Track B fine-tuning (B7) + benchmark (B8)

Written 2026-07-21 for the agent instance executing the training stage.
Everything below is verified state, not aspiration.

## Context in one paragraph

Restrudel fine-tunes YourMT3+ (spectrogram→MIDI transformer) for synth-heavy
electronic music. Phase 6 produced **strudel50** (Synth Lead 0.000→0.515 vs
base, but slakh forgetting −15 and an eval critique). Track B rebuilt the data
pipeline: repo-level leak-free split (B5), timbre-coverage generation (B6),
and two new electronic datasets. Your job is **B7**: fine-tune v2 from the
released checkpoint on the new mix, two seeds — then **B8**: benchmark it.
`docs/roadmap.md` (Phase 8) is the authoritative plan;
`docs/benchmark_interpretation_20260713.md` holds the v1 numbers you are
trying to beat and the critique that shaped v2.

## Code

- Repo: `github.com/henrik253/Restrudel`, branch
  **`worktree-trackb-pipeline-fixes`** (NOT master — master lacks the entire
  v2 pipeline). Set `RESTRUDEL_BRANCH=worktree-trackb-pipeline-fixes` before
  running the notebooks; they clone the repo themselves on Colab.
- Do not merge anything to master; commit any result docs to this branch.

## Data (all in Google Drive `restrudel/datasets`, loader-ready)

| dataset | songs (train/val/test) | notes |
|---|---|---|
| strudel | 1,858 / 45 / 48 | 929 base train (511 corpus + 418 coverage sketches) + 929 augmented variants; test = held-out-author corpus only, verified 0 leak |
| nesmdb | 4,500 / 402 / 372 | real 2A03 chiptune, 46.1 h; synth bass (prog 38) in 4,670 songs — the class Slakh dropped |
| slakh / maestro / egmd | canonical splits | replay sets against forgetting |
| metamidi_electronic | 2,000 MIDIs, no audio | feedstock only — NOT trainable, ignore for B7 |

Index paths inside the `*_file_list.json` files are absolute paths from the
build machine — **notebook 04 §2's rewrite cell fixes them for your
DATA_HOME; run it before training** (all `DOWNLOAD` flags stay False).

## How to run B7

1. Colab GPU runtime, ideally A100-40GB. Mount Drive.
2. `notebooks/04_data_preparation.ipynb`: run §1–§3 + the split-check cell
   (§6). Expect "ALL SPLIT CHECKS PASSED". All downloads stay disabled.
3. `notebooks/05_finetune.ipynb`:
   - First pass with `SMOKE_TEST = True` (10 steps) end-to-end. This also
     registers the data presets (sentinel-block replacement — safe to re-run).
   - Then `SMOKE_TEST = False`: **LR 3e-5, cosine + 1000-step warmup, 10k
     steps, two variants `v2mix_s42` / `v2mix_s1337`** = the SAME mix
     (strudel .45 / nesmdb .15 / slakh .20 / maestro .10 / egmd .10 —
     computed automatically because nesmdb indexes exist) with seeds 42/1337
     via `pl.seed_everything`. Do not resurrect the old egmd50 arm.
   - Budget: 3,000 steps took ~3.5 h on A100-40 at bsz (8,16); expect
     **~11–12 h per seed** at 10k. On a smaller GPU the batch ladder drops
     and time balloons — consider running seed 42 to completion first.
   - Training runs in-kernel (foreground); keep the tab alive. Checkpoints +
     `metadata.json` land in Drive `checkpoints/YourMT3+_fine_tuned_<variant>_<ts>/`.
4. `notebooks/06_benchmark.ipynb` on a FRESH GPU runtime: it discovers the
   latest `comparison_<ts>` run, benchmarks base + both seeds per category
   (note-level F1, mir_eval ±50 ms), writes charts +
   `comparison_results.json` to Drive.

## Known gotchas (all real, all hit before)

- Google Drive FUSE throws transient `OSError(Errno 5)`; nb05 patches a
  retry + `num_workers=1`. Don't "fix" workers upward.
- Validation pitched-class F1s log as NaN during training (known quirk;
  test.py scores them fine). Judge nothing from mid-run val class metrics.
- `transformers` is pinned `==4.39.3`; newer removes a module YourMT3 imports.
- The strudel train list interleaves `*_aug` entries (same labels, processed
  audio). nb05's rebase cell is aug-aware. Test/val contain no aug entries —
  keep it that way.
- nesmdb `midi_file` paths point into `nesmdb_midi/` (source MIDIs, also in
  Drive); only relevant if something touches `midi_file`.

## B8 reading rules (from the accepted critique)

- The strudel test split is only **48 songs** — quote per-class numbers with
  that caveat; do not average synthetic batches into one number.
- Report drums-excluded performance alongside `multi_f` (v1's headline was
  drum-carried), and per-class event counts for anything you claim.
- Decision gate: v2 replaces strudel50 only if it beats it on the target
  categories **without worse forgetting** (slakh/maestro reference F1). v1
  baselines: corpus Synth Lead 0.515 / Bass 0.169 / drums 0.844 /
  multi_f 0.839; forgetting slakh 0.831→0.682, maestro 0.949→0.842.
  The interesting v2 questions: does NES-MDB lift Bass? Does seed variance
  swallow the deltas?
- If both seeds finish, report mean ± spread per category, not just the max.

## Report back

A short markdown (commit as `docs/benchmark_interpretation_<date>.md` on this
branch): setup, per-category table vs base and strudel50, seed spread,
forgetting deltas, verdict against the gate, anomalies. Honest > flattering —
the v1 interpretation doc shows the expected level of scrutiny.
