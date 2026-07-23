# Restrudel 🎛️ → 🎼 → 💻

**Turning electronic music recordings into editable live-coding patterns — by teaching an AI transcription model the one thing it never learned: what synthesizers actually sound like.**

```
mp3 → spectrogram → fine-tuned transformer (AMT) → MIDI → LLM/rules → Strudel code
```

Upload a track, select a snippet, and get back working [Strudel](https://strudel.cc) code — a live-coding music language that runs in the browser — which you can immediately edit, remix, and play.

---

## The problem

The [Strudel REPL](https://strudel.cc) is a live-coding environment used **mostly for electronic music** — and Restrudel's goal is to turn an mp3 into a *similar* Strudel pattern. That makes the transcription step the bottleneck: state-of-the-art automatic music transcription (AMT) models such as **YourMT3+** were trained on acoustic and sampled instruments (piano, band recordings), **not on electronic music**. They learned "synthesizer" from a handful of static sampled patches, never from a real subtractive/FM/wavetable synth engine, and their datasets contain no synth bass at all. Their own evaluation shows Synth Lead transcription collapsing from F1 0.82 (in-domain) to **0.02 on real recordings**.

So before the pipeline can work at all, the model has to be **fine-tuned on the electronic-music data it was never trained on** — that is the core of this project.

## The idea

Instead of hand-labeling audio (expensive and error-prone), Restrudel **generates its own perfectly-labeled training data**. A Strudel pattern is *symbolic ground truth*: rendering it produces the audio, the MIDI events, and the source code from one origin — a perfectly aligned **(audio, MIDI, code)** triple with zero labeling effort.

To make the synthetic data realistic rather than random, I first **mined 855 real Strudel patterns** from public repositories and measured which synths, sounds, and effects musicians actually use (sawtooth leads through low-pass filters, TR-909/808 drums, …). Generation is weighted by these real-world distributions.

## Results: the fine-tune works ✅

The released YourMT3+ checkpoint was fine-tuned on the weighted synthetic Strudel corpus plus external electronic-music data ("v2mix"), with **two independent seeds** to verify the result isn't a lucky run. Note-level F1, base model vs. the two fine-tuned models:

| Benchmark | Metric | Base | v2 (seed 42) | v2 (seed 1337) | Δ best vs base |
|---|---|---|---|---|---|
| **Strudel corpus** (test, 48 real songs) | multi-instr F1 | 0.207 | **0.462** | 0.460 | **+0.26** |
| | pooled onset F1 | 0.373 | 0.334 | 0.309 | −0.04 |
| **Strudel synthetic b1** (val-diag, 18) | multi-instr F1 | 0.109 | 0.422 | **0.446** | **+0.34** |
| | pooled onset F1 | 0.159 | 0.309 | **0.320** | +0.16 |
| **NES-MDB** (test, 50) | multi-instr F1 | 0.068 | **0.606** | 0.599 | **+0.54** |
| | pooled onset F1 | 0.351 | **0.640** | 0.626 | +0.29 |

How to read this:

- **Multi-instrument F1** ("right note *and* right instrument") is the fairest single number for the task — and it jumps everywhere: **+0.26 on real, human-written Strudel songs** the model never saw, and **+0.54 on NES-MDB**, an *external* electronic-music dataset (NES chiptune) that proves the gains are not limited to audio from Strudel's own synth engine.
- The two seeds land within ~0.01–0.02 of each other on every number — the improvement is **reproducible, not noise**.
- Honest caveat: pooled onset F1 on the real-song corpus dips slightly (−0.04) — the fine-tuned model detects marginally fewer raw onsets but attributes what it finds to the correct instruments far more often, which is what matters for generating playable Strudel code.

The test split is **leak-free by construction**: held-out songs come from entire repositories the model never trained on, not just held-out files.

## What's in progress right now 🚧

Two parallel tracks:

**Track A — The application (Phase 7).** A full-stack web app so anyone can use the model: **React + Vite** frontend with an embedded Strudel REPL, **Node.js** backend on a personal server, and the GPU model deployed on **RunPod Serverless** (scale-to-zero — costs nothing while idle). Upload a song, pick a 3–10 s snippet, get editable code. Frontend and backend are merged; deployment hardening is ongoing.

**Track B — Model v2 (Phase 8).** Push beyond Strudel-rendered audio toward **electronic music in general**: fixed a data-leak in the evaluation split (now split by *repository*, not by file), grew the corpus, added external electronic datasets and audio augmentation, and rendered patterns through a **real hardware-grade synth engine (Surge XT)** in addition to Strudel's own. The two v2 models are trained and benchmarked (results above); next up is deeper evaluation on real-world EDM recordings and shipping the winning checkpoint into the app's model registry.

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
