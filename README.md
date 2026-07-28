# Restrudel

### Turn mp3 snippets into Strudel code.

> 🚧 **Beta** — Restrudel is released as **v0.9.0-beta**: the full pipeline
> works end-to-end, and rough edges are expected. Debug tooling lives in the
> app under *Developer (beta)*.

Upload a track, select a few seconds, and get back an editable, playable
[Strudel](https://strudel.cc) live-coding pattern — remix it right in the browser.

## How it works

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/pipeline_dark.svg">
  <img alt="Pipeline: mp3 → spectrogram → fine-tuned YourMT3+ → MIDI → rule-based MIDI-to-Strudel → refactor & enhance → final Strudel code" src="docs/assets/pipeline_light.svg">
</picture>

The transcription model is the heart of the pipeline: an automatic music
transcription transformer **fine-tuned on synthesizer timbres** — the one thing
stock models have never heard, and the reason they fail on electronic music.

## Architecture

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/architecture_dark.svg">
  <img alt="Architecture: browser React SPA → Caddy + Node backend on an Ubuntu server → RunPod serverless GPU worker running the fine-tuned YourMT3+ (v2mix); the backend calls the Claude API for code polish" src="docs/assets/architecture_light.svg">
</picture>

The song is uploaded once; every new snippet selection is just a time range.
The GPU bills per second only while a request runs and scales to zero when
idle. Checkpoints are versioned on the network volume, so a better model
deploys by uploading a directory — no code changes.

## Does the fine-tuning work?

The base model transcribes acoustic instruments well — and collapses on
synthesizers. Fine-tuning on synthetic Strudel renders, real chiptune, and
timbre-coverage augmentation fixes exactly that:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/benchmark_dark.png">
  <img alt="Dumbbell chart of multi-instrument note F1, base YourMT3+ versus the Restrudel v2mix fine-tune: real Strudel songs 0.21 to 0.46 (+0.26), synthetic Strudel 0.11 to 0.42 (+0.31), NES-MDB chiptune 0.07 to 0.61 (+0.54). All test sets are leak-free and held out." src="docs/assets/benchmark_light.png">
</picture>

The gains hold on **real songs by held-out artists** and on an **external
dataset the model never saw** — and they are reproducible: a second training
seed lands within ±0.02 on every number.

---

<sub>Master's project by Henrik Flöter · current release: **v0.9.0-beta** · deep-dive docs:
[roadmap](docs/roadmap.md) ·
[application architecture](docs/application_architecture.md)</sub>
