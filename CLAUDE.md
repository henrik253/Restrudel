# Restrudel

Convert a song (mp3/mp4) into Strudel live-coding code that plays a recognizable cover of it.

**End goal:** A browser application where users upload an mp3/mp4 and receive working Strudel code (https://strudel.cc). First milestone is a local CLI pipeline that does this for a single stem; the web app comes later.

## How it works (pipeline)

The core insight: LLMs can't hear, so audio ML tools do the "listening" and the LLM only does the final code-writing step.

```
audio file (mp3/mp4)
  → [Demucs]        source separation into stems (drums.wav, bass.wav, vocals.wav, other.wav)
  → [Basic Pitch]   transcription of pitched stems to MIDI (note events: pitch, start, duration, velocity)
  → [our code]      beat/tempo detection, quantize MIDI events to a bar/step grid,
                    serialize as compact human-readable text events
  → [LLM]           translate text events into idiomatic Strudel code
  → [validation]    eval the generated code headlessly, query the pattern's events,
                    diff against the transcription, retry with error feedback on mismatch
```

Key design decisions:
- The output is a *cover*, not a reproduction. Strudel plays synths/samples; vocals become a synth lead at best. "As close as possible" = good instrumental cover.
- LLM stage should produce *idiomatic* Strudel (mini-notation compression `*` `<>` `[]` `!`, `stack()`, variation functions), not giant literal event dumps. Rule-based generation is the correctness baseline; LLM is the readability layer.
- Validation loop is non-negotiable: LLMs confuse Strudel with TidalCycles (Haskell) syntax and hallucinate functions. Strudel is a JS library on npm — generated code can be evaluated headlessly and patterns can be queried for their events without playing audio.
- Process songs in sections (intro/verse/chorus), not whole songs at once. Use self-similarity analysis for structure detection; compose sections with Strudel's `arrange()`.

## Current state (June 2026)

- [x] Concept validated: Demucs separation works end-to-end on a real track
- [x] Conda env `restrudel` (Python 3.11) with working Demucs install
- [x] First track separated: `separated/htdemucs/Vlinderen-144x144-mp4a/{bass,drums,vocals,other}.wav`
- [ ] Basic Pitch install + first bass transcription to MIDI
- [ ] MIDI → text-events dump script (mido)
- [ ] First manual LLM conversion experiment (paste events into LLM, paste result into strudel.cc)
- [ ] Automate the loop

## Environment & gotchas (hard-won, do not regress)

- **Python 3.11 only.** Demucs is unmaintained and breaks on 3.13 (and its PyPI sdist is broken — missing `requirements_minimal.txt`).
- **Install Demucs from GitHub, not PyPI:** `pip install git+https://github.com/adefossez/demucs`
- **Pin `numpy<2`.** The installed PyTorch is compiled against NumPy 1.x; NumPy 2.x crashes torch imports.
- The TorchAudio "global backend is now deprecated" warning is harmless — ignore it.
- Basic Pitch pulls in TensorFlow; expect a heavy install and possible version friction on py3.11.
- Demucs accepts mp4 directly (decodes via ffmpeg). First run downloads ~80–300 MB of model weights to `~/.cache/torch/hub/checkpoints/`.
- Machine is a MacBook Air (CPU inference) — separation takes ~40s/track with htdemucs; don't add GPU-only code paths.

## Common commands

```bash
conda activate restrudel

# Separate all 4 stems
demucs path/to/song.mp3

# Faster: only the stem we need vs everything else
demucs --two-stems bass path/to/song.mp3

# Transcribe a stem to MIDI (outputs into midi_out/)
basic-pitch midi_out separated/htdemucs/<track>/bass.wav
```

Output layout: `separated/htdemucs/<trackname>/{bass,drums,vocals,other}.wav`

## Roadmap

1. **Phase 1 — CLI MVP (bass only):** song file in → Strudel snippet for the bass line out. Pieces: Demucs (done), Basic Pitch, tempo detection (librosa/madmom), quantizer, MIDI→text serializer, LLM prompt template, headless validation.
2. **Phase 2 — multi-stem:** add drums (onset detection + classification; maps directly to `s("bd sd hh")` mini-notation — highest-value stem), chords from the "other" stem, melody from vocals. `stack()` the layers.
3. **Phase 3 — quality:** pattern compression (detect repeats/variations via self-similarity), section detection + `arrange()`, the eval→query→diff→retry validation loop, "exact" vs "vibes" fidelity modes.
4. **Phase 4 — web app:** upload UI, server-side pipeline (separation/transcription are too heavy for the browser), job queue + progress feedback (separation+transcription takes minutes), result page with embedded Strudel REPL playing the generated code. Mind LLM cost per conversion if it's a free public tool.

## Conventions

- Keep the pipeline stages decoupled: each stage reads/writes files (wav → mid → events.txt → output.strudel) so stages can be tested and swapped independently.
- The intermediate text-event format is the contract between transcription and codegen — version it and keep it human-readable (it doubles as the LLM prompt payload).
- Prefer boring, deterministic code for stages 1–3; all creativity/nondeterminism is isolated in the LLM stage where the validator can check it.
- Test material: keep 2–3 reference tracks with known BPM and simple basslines for regression-testing transcription quality.
