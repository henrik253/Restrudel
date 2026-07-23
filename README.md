# Restrudel 🎛️ → 🎼 → 💻

**Turning electronic music recordings into editable live-coding patterns — by teaching an AI transcription model the one thing it never learned: what synthesizers actually sound like.**

```
mp3 → spectrogram → fine-tuned transformer (AMT) → MIDI → LLM/rules → Strudel code
```

Upload a track, select a snippet, and get back working [Strudel](https://strudel.cc) code — a live-coding music language that runs in the browser — which you can immediately edit, remix, and play.

---

## The problem

State-of-the-art automatic music transcription (AMT) models such as **YourMT3+** are excellent at piano, drums, and acoustic band recordings — and nearly useless on **synth-heavy electronic music**. The reason is the training data: these models learned "synthesizer" from a handful of static sampled patches, never from a real subtractive/FM/wavetable synth engine, and their datasets contain **no synth bass at all**. Their own evaluation shows Synth Lead transcription collapsing from F1 0.82 (in-domain) to **0.02 on real recordings**.

In short: the dominant genre of the last three decades is a blind spot for music transcription AI.

## The idea

Instead of hand-labeling audio (expensive and error-prone), Restrudel **generates its own perfectly-labeled training data**. A Strudel pattern is *symbolic ground truth*: rendering it produces the audio, the MIDI events, and the source code from one origin — a perfectly aligned **(audio, MIDI, code)** triple with zero labeling effort.

To make the synthetic data realistic rather than random, I first **mined 855 real Strudel patterns** from public repositories and measured which synths, sounds, and effects musicians actually use (sawtooth leads through low-pass filters, TR-909/808 drums, …). Generation is weighted by these real-world distributions.

## Results: the fine-tune works ✅

The released YourMT3+ checkpoint was fine-tuned on this synthetic corpus (~3.5 GPU-hours on a single A100). Note-level F1 on a held-out test set of **111 real, human-written Strudel songs** the model never saw:

| Category (onset F1) | Base YourMT3+ | Fine-tuned (strudel50) | Δ |
|---|---|---|---|
| **Synth Lead** | **0.000** | **0.515** | +0.52 |
| Synth Bass | 0.000 | 0.169 | +0.17 |
| Drums | 0.530 | 0.844 | +0.31 |
| Multi-instrument F1 (right note *and* right instrument) | 0.521 | **0.839** | +0.32 |

The base model produced **literally zero** correct synth-lead or bass notes — the documented failure mode, quantified. After fine-tuning, the model attributes notes to the correct instruments across the board.

Honest caveats (full adversarial self-review in [docs/benchmark_interpretation_20260713.md](docs/benchmark_interpretation_20260713.md)):
- Gains are proven on audio from the same synthesis engine it trained on; generalization to arbitrary EDM recordings is the current work (see below).
- The fine-tune trades away some acoustic-band generality (Slakh −15, MAESTRO −11 F1) — an acceptable cost for a specialist model, with known mitigations (lower LR, replay).

An A/B experiment with a second variant (percussion-heavy mix) confirmed the design choice: **there is no substitute for training on the target timbre distribution.**

## What's in progress right now 🚧

Two parallel tracks:

**Track A — The application (Phase 7).** A full-stack web app so anyone can use the model: **React + Vite** frontend with an embedded Strudel REPL, **Node.js** backend on a personal server, and the GPU model deployed on **RunPod Serverless** (scale-to-zero — costs nothing while idle). Upload a song, pick a 3–10 s snippet, get editable code. Frontend and backend are merged; deployment hardening is ongoing.

**Track B — Model v2 (Phase 8).** Push beyond Strudel-rendered audio toward **electronic music in general**: fixed a data-leak in the evaluation split (now split by *repository*, not by file), grew the corpus, added external electronic datasets and audio augmentation, and rendered patterns through a **real hardware-grade synth engine (Surge XT)** in addition to Strudel's own. Two v2 candidate models (independent seeds) are trained; the final benchmark against v1 is the last remaining step.

## Tech stack

- **ML:** PyTorch, fine-tuning a ~60M-param encoder–decoder AMT transformer (YourMT3+), mir_eval benchmarking, Colab/A100 training
- **Data engineering:** Node.js pipeline driving Strudel's pure-JS engine headlessly (`queryArc` label extraction, `OfflineAudioContext` faster-than-realtime rendering), Surge XT synth rendering, corpus mining with pandas/matplotlib, ~240 GB dataset management (Google Drive + rclone)
- **App:** React + Vite, Node.js WebSocket backend, RunPod Serverless GPU inference, LLM-assisted MIDI→Strudel code generation

## Repository map

| Path | What it is |
|---|---|
| [docs/project_plan.md](docs/project_plan.md) | The "why": goals and analysis of the base model's blind spot |
| [docs/roadmap.md](docs/roadmap.md) | The "what next": phased plan (source of truth) |
| [analysis/](analysis/) | Corpus mining: what real Strudel songs use, as sampling distributions |
| [data_gen/](data_gen/) | Node tooling: pattern → MIDI labels + audio rendering + generators |
| [notebooks/](notebooks/) | Colab notebooks: corpus analysis, dataset builds, fine-tuning |
| [app/](app/) | The web application (frontend + backend) |
| [docs/benchmark_interpretation_20260713.md](docs/benchmark_interpretation_20260713.md) | Full fine-tune results incl. adversarial critique |

*Master's project by Henrik Flöter. The corpus references 8 third-party Strudel repositories as git submodules (`git clone --recursive`).*
