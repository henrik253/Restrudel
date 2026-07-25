# B8 benchmark interpretation — v2mix vs base YourMT3+ (2026-07-25)

Final read of the Track B / Phase 8 fine-tune (run `comparison_20260722-050418`),
scored with `notebooks/06_benchmark.ipynb` on the repo-level leak-free split
(B5). All numbers are note-level F1 (`mir_eval`, onset ±50 ms). Raw metrics,
aggregates, and charts live in the run's Drive folder
(`benchmark_metrics_raw.json`, `benchmark_results.json`,
`comparison_overview.png`, `comparison_improvement.png`).

## Setup

- **Models:** released base YourMT3+ vs `v2mix_s42` / `v2mix_s1337` — the SAME
  mix (strudel .45 / nesmdb .15 / slakh .20 / maestro .10 / egmd .10), LR 3e-5,
  cosine + 1000-step warmup, 10k steps, bf16, seeds 42/1337 (nb05, one A100 run
  each, ~7.5 h).
- **Eval:** strudel corpus test = 48 held-out-author songs (eefano +
  honcoops repos; provably leak-free, but small — quote per-class numbers with
  that caveat). Synthetic batch_1 = validation files (val-diag: measures
  learning, not generalization). NES-MDB/maestro/slakh = canonical test splits
  capped at 50 files (±2–3 pt sampling noise). egmd: run for s42 only
  (scope decision 2026-07-25).
- **strudel50 (v1) is excluded** from the comparison (decision 2026-07-24): its
  synthetic training data was generated from distributions computed over the
  FULL corpus — including today's test authors — so its corpus-test score is
  leak-advantaged. (Measured once for the record: corpus multi_f 0.563,
  nesmdb multi_f 0.260 — a Strudel specialist that fails on broader
  electronic audio.)

## Results

### Electronic (target) categories

| category | metric | base | v2mix_s42 | v2mix_s1337 |
|---|---|---|---|---|
| **strudel corpus** (test, 48) | multi-instr F1 | 0.207 | **0.462** | 0.460 |
| | pooled onset F1 | **0.373** | 0.334 | 0.309 |
| | Synth Lead | 0.000 | 0.290 | 0.294 |
| | Bass | 0.100 | 0.102 | 0.083 |
| | drums | 0.346 | 0.666 | 0.675 |
| **nesmdb** (test, 50) | multi-instr F1 | 0.068 | **0.606** | 0.599 |
| | pooled onset F1 | 0.351 | **0.640** | 0.626 |
| | Synth Lead | 0.047 | 0.619 | 0.603 |
| | Bass | 0.153 | **0.646** | 0.640 |
| | drums | 0.056 | 0.716 | 0.711 |
| **synthetic b1** (val-diag, 18) | multi-instr F1 | 0.109 | 0.422 | 0.446 |

### Reference (forgetting) categories

| category | metric | base | v2mix_s42 | v2mix_s1337 | v1 strudel50 (context) |
|---|---|---|---|---|---|
| **maestro** (50) | onset F1 | 0.949 | 0.868 | 0.874 | 0.842 |
| **slakh** (50) | onset F1 | 0.831 | 0.700 | 0.696 | 0.682 |
| | drums | 0.860 | 0.845 | 0.847 | — |
| | Bass | 0.904 | 0.814 | 0.813 | — |
| | Synth Lead | 0.724 | 0.400 | 0.417 | — |
| **egmd** (50, s42 only) | drum onset F1 | 0.923* | 0.901 | — | 0.906* |

\* egmd base/strudel50 numbers are from the v1 run (`comparison_20260713-222456`,
same harness and caps, different runtime) — cross-run context, not a same-run
comparison.

### Aggregates (fair subsets only)

- **Electronic test average** (corpus + nesmdb, primary F1): base 0.362 →
  s42 **0.487** / s1337 0.468. (The Drive JSON's `electronic_avg` for s42 is
  0.625 because it includes egmd, which only s42 has — do not compare that
  number across seeds.)
- **Average per-metric delta vs base (s42)**: corpus +0.088 (n=19 metrics),
  synthetic +0.257 (n=17), nesmdb +0.459 (n=15), maestro −0.089 (n=9),
  slakh −0.136 (n=51).
- **Seed spread:** ≤ 0.025 on every shared metric in every category — the
  result is reproducible, not seed luck.

## Verdict against the gate

Gate (roadmap B8): beat the incumbent on target categories without worse
forgetting. With strudel50 disqualified for leakage, the reference points are
base (must-beat) and v1's forgetting levels (must-not-be-worse).

- **Target: pass.** Every electronic category improves vs base — corpus
  multi-instr 2.2×, NES-MDB multi-instr 8.9×, Synth Lead from literal 0.000 on
  corpus to 0.29 (and 0.62 on nesmdb). Synth bass — the class the base model
  never trained on — reaches 0.65 on nesmdb.
- **Forgetting: pass.** maestro −0.075/−0.081 and slakh −0.131/−0.135 vs
  base — both smaller drops than v1's (−0.107 / −0.149) despite 3× the
  training steps. egmd drums essentially held (0.901 vs 0.923 v1-base).
- **Decision:** `v2mix_s42` ships (marginally ahead of s1337 on the electronic
  test average; already wired as the deployment model in the app registry,
  PR #8).

## Anomalies & open items (honest list)

1. **Pooled onset F1 on corpus regresses** (0.373 → 0.334). Base finds pitched
   notes but files them under wrong instruments; v2 trades some raw
   note-recall for instrument correctness. multi_f is the honest headline for
   a multi-instrument product; both are reported.
2. **Corpus Bass is unsolved** (0.10 → 0.10). NES-MDB bass skill (0.65) did
   not transfer to Strudel bass timbres. Candidate next lever: the Surge XT
   render of the GigaMIDI feedstock (`DOWNLOAD['synth']` in nb04, built but
   never executed) for non-chiptune synth-bass timbre diversity.
3. **Slakh Synth Lead halves** (0.724 → 0.40/0.42). The fine-tune re-anchored
   "Synth Lead" toward real synth timbres and away from Slakh's Kontakt
   patches. Defensible for the product; it is the biggest single contributor
   to the slakh drop.
4. **48-song test split** — per-class numbers carry wide error bars; treat
   ±0.05 differences as noise.
5. **egmd was only run for s42** (scope decision); the sweep also survived two
   Colab runtime deaths — resumability (progressive Drive writes + cached
   re-runs) is what got it finished.
