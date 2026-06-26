# CLAUDE.md

Guidance for agents working in this repo. Read this first, then
[project_plan.md](project_plan.md) (the "why") and [roadmap.md](roadmap.md)
(the step-by-step "what next").

## What this project is

**Restrudel** builds a pipeline that transcribes an **mp3 → editable Strudel REPL
code**, focused on **synth-heavy electronic music** — the case where existing
transcribers (YourMT3+, etc.) fail.

```
mp3 → preprocessing → spectrogram → transformer (AMT) → MIDI → LLM/rules → Strudel code
```

### The core thesis (why this can work)
Models like **YourMT3+** take a 16 kHz log-mel/log-mag **spectrogram** and emit
**MIDI-like event tokens**. They are trained on datasets (Slakh, MAESTRO, …) whose
"synthetic" audio is MIDI rendered through **sampled acoustic instruments** —
never subtractive/FM/wavetable **synthesizers**. That is exactly why they score
<10% on electronic/pop synth timbres.

**Our differentiator:** generate training data by **rendering MIDI through real
synths and Strudel's own engine**, so the model finally sees synth timbres.
Strudel is special here: a pattern is the symbolic ground truth, so one source
yields aligned **(audio WAV, MIDI/events, Strudel code)** triples — no
transcription needed to get labels.

## Current state (what exists)
- **Phase 0–1 done.** Phase 2+ not started; see roadmap.
- **Corpus** of 8 third-party Strudel repos as **shallow git submodules** under
  `corpus/sources/` (GPL code referenced, not vendored). Re-install with
  `git clone --recursive` or `git submodule update --init --recursive`.
- **Analysis** (`analysis/analyze_corpus.py`) extracted 855 unique patterns and
  ranked sound/synth/effect usage → `analysis/out/` + `analysis/REPORT.md`.
  Headline: **`sawtooth` is the dominant synth**, shaped by `lpf` + `release` +
  `room`/`delay`; drums are `bd/sd/hh/cp` on TR909/808/Linn banks. Synthetic
  generation must be **weighted by these distributions, not uniform-random**.

## Repo layout
- `project_plan.md` — goals, YourMT3+ analysis, data strategy.
- `roadmap.md` — phased plan; **the source of truth for next steps**.
- `corpus/sources/*` — Strudel song/pattern submodules (input to analysis).
- `analysis/` — corpus parser (`analyze_corpus.py`) + outputs (`out/`, `REPORT.md`).
- `data_gen/` — (Phase 2+) Node tooling: pattern→MIDI labels, audio render, generators.
- `notebooks/` — Colab orchestration (`00_setup.ipynb`); Drive used only for the
  heavy WAV dataset (via DVC, see `docs/dvc.md`). Small artifacts live in git.

## Conventions
- **Storage:** code + small artifacts (corpus submodules, analysis, MIDI) in git;
  GB-scale WAV audio → Google Drive via **DVC** (`gdrive://` remote; only `.dvc`
  pointers committed), not committed directly. Setup/workflow: `docs/dvc.md`.
- **Audio render (Part B):** prefer scalable `OfflineAudioContext`
  (faster-than-realtime); headless-browser is the proven fallback.
- **Strudel engine is pure JS** → label extraction runs in Node
  (`@strudel/transpiler` + `@strudel/mini`, `pattern.queryArc(...)`). No browser
  needed for labels.
- Python analysis uses matplotlib/pandas; re-run with
  `python3 analysis/analyze_corpus.py`.

## Workflow for new features (REQUIRED)

When the user prompts for a **new feature or change**, do not work on `master`:

1. **Create a dedicated branch and an isolated git worktree for it** (use the
   worktree tooling so `master` stays untouched). Branch name should describe the
   feature, e.g. `phase2-midi-labeler`.
2. **Do all the work inside that worktree**, committing as you go.
3. **Hand the changes back to the user to review** — summarize what changed and
   where. The user reads the diff and **decides** whether to merge.
4. **Only merge into `master` when the user approves.** Merge with `--no-ff`,
   push, and confirm all branches are merged. Do not auto-merge or push to
   `master` without that approval.

This keeps `master` always-reviewed: every feature is an isolated, reviewable
unit the user opts into.

## Pointers
- Next steps: always check [roadmap.md](roadmap.md) — work proceeds phase by phase.
- End git commit messages with the `Co-Authored-By: Claude` trailer.
