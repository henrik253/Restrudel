# CLAUDE.md

Guidance for agents working in this repo. Read this first, then
[docs/project_plan.md](docs/project_plan.md) (the "why") and
[docs/roadmap.md](docs/roadmap.md) (the step-by-step "what next").

## What this project is

**Restrudel** builds a pipeline that transcribes an **mp3 → editable Strudel REPL
code**, focused on **synth-heavy electronic music** — the case where existing
transcribers (YourMT3+, etc.) fail.

```
mp3 → preprocessing → spectrogram → transformer (AMT) → MIDI → LLM/rules → Strudel code
```

### The core thesis (why this can work)
Models like **YourMT3+** take a 16 kHz log-mel/log-mag **spectrogram** and emit
**MIDI-like event tokens**. Their entire synth-timbre experience is **Kontakt
sample playback** (~26 static lead/pad patches in Slakh) — no audio from a live
subtractive/FM/wavetable engine, and **no synth bass at all** (Slakh silently
skipped GM 38–39). Result, from their own eval: Synth Lead F1 **0.82 in-domain
collapses to 0.02 on real recordings** (verified 2026-07-15, see
`docs/roadmap.md` Phase 8 B0).

**Our differentiator:** generate training data by **rendering MIDI through real
synths and Strudel's own engine**, so the model finally sees synth timbres.
Strudel is special here: a pattern is the symbolic ground truth, so one source
yields aligned **(audio WAV, MIDI/events, Strudel code)** triples — no
transcription needed to get labels.

## Current state (what exists)
- **Phases 0–6 done** (data pipeline, dataset, fine-tune + benchmark). The
  fine-tuned **strudel50** checkpoint beats base YourMT3+ on every Strudel
  category (details: `docs/benchmark_interpretation_20260713.md`). **Current
  work is twin tracks:** Phase 7 (full-stack app: React frontend, Node backend
  on the personal server, RunPod Serverless GPU — see
  `docs/application_architecture.md`) and Phase 8 (model v2: eval fixes, then
  shift toward electronic music broadly). See roadmap.
- **Corpus** of 8 third-party Strudel repos as **shallow git submodules** under
  `corpus/github/` (GPL code referenced, not vendored). Re-install with
  `git clone --recursive` or `git submodule update --init --recursive`.
- **Analysis** (`analysis/analyze_corpus.py`) extracted 855 unique patterns and
  ranked sound/synth/effect usage → `analysis/out/` + `analysis/REPORT.md`.
  Headline: **`sawtooth` is the dominant synth**, shaped by `lpf` + `release` +
  `room`/`delay`; drums are `bd/sd/hh/cp` on TR909/808/Linn banks. Synthetic
  generation must be **weighted by these distributions, not uniform-random**.

## Repo layout
- `docs/project_plan.md` — goals, YourMT3+ analysis, data strategy.
- `docs/roadmap.md` — phased plan; **the source of truth for next steps**.
- `corpus/github/*` — Strudel song/pattern submodules (input to analysis).
- `analysis/` — outputs of the corpus analysis: plots in `out/`, machine-readable
  stats in `results/*.json` (with sampling weights/probs, for `data_gen/`).
- `data_gen/` — (Phase 2+) Node tooling: pattern→MIDI labels, audio render, generators.
- `dataset/` — generated training songs (created on demand by generation; not a
  tracked folder). Layout + how it's produced: `docs/dataset_layout.md`.
- `notebooks/` — `00_setup.ipynb` (Colab/Drive); `01_strudel_corpus_analysis.ipynb` is the
  corpus analysis (sounds, functions, transitions → `analysis/results/`). Drive
  used only for the heavy WAV dataset (sync mechanism TBD); small artifacts live
  in git.

## Conventions
- **Storage:** code + small artifacts (corpus submodules, analysis, MIDI) in git;
  GB-scale WAV audio → Google Drive (sync mechanism TBD), not committed directly.
- **Audio render (Part B):** prefer scalable `OfflineAudioContext`
  (faster-than-realtime); headless-browser is the proven fallback.
- **Strudel engine is pure JS** → label extraction runs in Node
  (`@strudel/transpiler` + `@strudel/mini`, `pattern.queryArc(...)`). No browser
  needed for labels.
- Corpus analysis is the notebook `notebooks/01_strudel_corpus_analysis.ipynb`
  (matplotlib/pandas); re-run it top-to-bottom to refresh `analysis/out/` and
  `analysis/results/`.
- **Colab MCP (fork, not upstream):** cloud runtime work (e.g. running
  `notebooks/04_finetune_data.ipynb`, downloading reference sets to Drive) uses
  the `colab-mcp` MCP server. We run a **local patched fork of
  `googlecolab/colab-mcp`, not the upstream package** — upstream hardcodes a
  scratch notebook so every reconnect opens a fresh blank one (their
  discussion #80). The fork adds a `COLAB_MCP_NOTEBOOK_URL` env var so reconnects
  reopen a pinned notebook (currently `notebooks/04_finetune_data.ipynb` via its
  GitHub Colab URL) and reattach using the still-live proxy token/port. The MCP
  config points `uvx --from <local-fork-path> colab-mcp` with that env set;
  config changes need an MCP-server restart to take effect. Long downloads must
  be launched **backgrounded + logging to Drive**, never as a blocking cell (a
  blocking multi-minute cell drops the MCP WebSocket).
- **Task-completion report (REQUIRED):** when a task is finished, end the reply
  with a **step-by-step bullet report** that maps what was done back to what was
  asked — one bullet per step, in the order it happened, so the path from request
  to result is auditable. Note anything skipped, deferred, or still running.

## Workflow for new features (REQUIRED)

When the user prompts for a **new feature or change**, do not work on `master`.

**Branch vs. worktree — keep these straight.** The *branch* holds the commits
(the actual changes); the *worktree* is just a throwaway directory under
`.claude/worktrees/` where you edit files on that branch. What ends up in
`master` is the **branch's changes**, merged in — **never the worktree directory
itself**. After the merge, the worktree is disposable and must be removed.

1. **Create a feature branch in an isolated worktree** (use the worktree tooling
   so `master` stays untouched). The branch name should describe the feature,
   e.g. `phase2-midi-labeler`. Note the tooling may prefix it (e.g.
   `worktree-phase2-midi-labeler`) — that prefix is just part of the branch name,
   not a sign the worktree is being merged.
2. **Do all the work inside that worktree**, committing to the branch as you go.
3. **Hand the changes back to the user to review** — summarize what changed and
   where. The user reads the diff and **decides** whether to merge.
4. **Only when the user approves, merge the BRANCH into `master`** with `--no-ff`.
   Push only if the user asks. Do not auto-merge or push without approval. The
   result: `master` contains the changes — and nothing worktree-related.
5. **Clean up after merging:** remove the worktree directory and delete the now
   merged branch (`git worktree remove …` + `git branch -d …`), so no worktree or
   stray feature branch lingers. Confirm `master` is the only worktree and the
   branch shows as merged.

This keeps `master` always-reviewed: every feature is an isolated, reviewable
unit the user opts into — with no leftover worktrees or branches behind it.

## Pointers
- Next steps: always check [docs/roadmap.md](docs/roadmap.md) — work proceeds phase by phase.
- End git commit messages with the `Co-Authored-By: Claude` trailer.
