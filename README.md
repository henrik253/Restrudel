# Restrudel

### Turn mp3 snippets into Strudel code.

Upload a track, select a few seconds, and get back an editable, playable
[Strudel](https://strudel.cc) live-coding pattern — remix it right in the browser.

## How it works

```mermaid
flowchart LR
    A(["🎵 &nbsp;mp3"]) --> B["Spectrogram"]
    B --> C["<b>fine-tuned<br/>YourMT3+</b>"]
    C --> D(["🎹 &nbsp;MIDI"])
    D --> E["rule-based<br/>MIDI&nbsp;→&nbsp;Strudel"]
    E --> F["✨ refactor<br/>&amp; enhance"]
    F --> G(["▶&nbsp; final<br/>Strudel code"])

    classDef step stroke-width:1px
    classDef model fill:#2a78d6,stroke:#184f95,color:#ffffff,stroke-width:2px
    classDef artifact fill:#1c5cab,stroke:#184f95,color:#ffffff
    class B,E,F step
    class C model
    class A,D,G artifact
```

The transcription model is the heart of the pipeline: an automatic music
transcription transformer **fine-tuned on synthesizer timbres** — the one thing
stock models have never heard, and the reason they fail on electronic music.

## Architecture

```mermaid
flowchart LR
    subgraph CLIENT["&nbsp;🖥️ &nbsp;Browser&nbsp;"]
        UI["React SPA<br/><i>waveform snippet select<br/>embedded Strudel REPL</i>"]
    end
    subgraph SERVER["&nbsp;☁️ &nbsp;Ubuntu server&nbsp;"]
        CADDY["Caddy<br/><i>HTTPS · static frontend</i>"]
        BE["Node backend<br/><i>WebSocket jobs · ffmpeg snippet cut<br/>MIDI-To-Strudel codegen</i>"]
    end
    subgraph GPU["&nbsp;⚡ RunPod Serverless — scale-to-zero GPU&nbsp;"]
        W["Transcription worker<br/><i>fine-tuned YourMT3+ (v2mix)<br/>checkpoint on a network volume</i>"]
    end
    LLM["🤖 Claude API<br/><i>code polish</i>"]

    UI -- "mp3 upload · snippet {start, end}" --> CADDY --> BE
    BE -- "16 kHz WAV" --> W
    W -- "note events + tempo" --> BE
    BE -- "raw pattern" --> LLM
    LLM -- "readable code" --> BE
    BE -- "Strudel code" --> UI

    style CLIENT fill:transparent,stroke:#2a78d6,stroke-width:2px
    style SERVER fill:transparent,stroke:#898781,stroke-width:2px
    style GPU fill:transparent,stroke:#eb6834,stroke-width:2px
    style LLM stroke-dasharray: 5 5
```

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

<sub>Master's project by Henrik Flöter · deep-dive docs:
[roadmap](docs/roadmap.md) ·
[application architecture](docs/application_architecture.md) ·
[benchmark analysis](docs/benchmark_interpretation_20260713.md)</sub>
