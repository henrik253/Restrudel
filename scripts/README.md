# scripts

End-to-end prototype of the Restrudel pipeline, one stage per script:

```
Strudel code ──▶ WAV ──▶ YourMT3+ ──▶ MIDI ──▶ Haiku 4.5 ──▶ Strudel code ──▶ WAV
             render_offline   yourmt3_transcribe   midi_to_strudel   render_offline
```

| Script | Does |
|---|---|
| `fetch_yourmt3.py` | Download the YourMT3+ code + YPTF.MoE+Multi (noPS) checkpoint into `models/` (gitignored, ~536 MB). Run once. |
| `yourmt3_transcribe.py` | WAV → MIDI. Wraps the HF Space's inference flow (CPU fp32). Also importable: `load_model()`, `transcribe_file()`. |
| `midi_to_strudel.py` | MIDI → Strudel code via `claude-haiku-4-5`, validated against the real Strudel engine (compiles + event density) with retry-on-error. Anthropic SDK, or `claude -p` fallback when no API key is set. |
| `midi_to_wav.py` | MIDI → audible WAV with a built-in synth (sine harmonics + drum noise) — no fluidsynth/soundfont needed. Lets you *hear* a raw transcription. |
| `run_pipeline.py` | **Orchestrator.** Runs all stages on one snippet into a fresh `runs/<timestamp>/` folder. |

## One-shot run

```bash
.venv/bin/python scripts/run_pipeline.py \
  --code 'stack(note("c2 c2 eb2 g1").s("sawtooth").lpf(800), s("bd*2, ~ cp, hh*4").bank("RolandTR909"))' \
  --cycles 4 --name demo
```

Produces `runs/<YYYYMMDD-HHMMSS>-demo/` with a WAV for every stage so you can
listen through the whole chain:

```
input.js  input.wav          the Strudel snippet and its audio
transcribed.mid  transcribed.wav   YourMT3+'s MIDI, made audible
output.js  output.wav         Strudel regenerated from the MIDI, and its audio
manifest.json                 inputs, model ids, per-stage note counts
```

`runs/` is gitignored. Also accepts `--file song.js` instead of `--code`.

## Setup

```bash
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python -r requirements.txt
.venv/bin/python scripts/fetch_yourmt3.py          # model (once)
( cd data_gen && npm install )                      # Strudel renderer (once)
```

`ffmpeg` is required (torchaudio audio I/O). The Haiku leg uses the Anthropic
SDK if `ANTHROPIC_API_KEY` / an `ant` login is present, else Claude Code
headless mode.
