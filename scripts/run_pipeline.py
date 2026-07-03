#!/usr/bin/env python3
"""Run the full Restrudel prototype on one Strudel snippet and save every stage.

    Strudel code -> WAV -> YourMT3+ -> MIDI -> Haiku 4.5 -> Strudel code -> WAV

Each run creates a fresh timestamped folder under runs/ containing every
artifact, and a rendered WAV for anything you'd otherwise only be able to read:

    runs/<YYYYMMDD-HHMMSS>/
      input.js         the input Strudel code
      input.wav        input rendered to audio (Strudel engine)
      transcribed.mid  YourMT3+'s transcription of input.wav
      transcribed.wav  that MIDI made audible (built-in synth) <- hear the model
      output.js        Strudel code regenerated from the MIDI by Haiku 4.5
      output.wav       output rendered to audio (Strudel engine)
      manifest.json    inputs, model ids, per-stage stats

Usage:
  .venv/bin/python scripts/run_pipeline.py --code 'note("c2 eb2").s("sawtooth")'
  .venv/bin/python scripts/run_pipeline.py --file song.js --cycles 8 --name bassline
"""
import argparse
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "scripts"))


def render_strudel(code_path: Path, wav_path: Path, cycles: int) -> str:
    r = subprocess.run(
        ["node", str(REPO / "data_gen" / "render_offline.mjs"),
         "--file", str(code_path), "--cycles", str(cycles), "--out", str(wav_path)],
        cwd=REPO / "data_gen", capture_output=True, text=True,
    )
    if r.returncode != 0:
        raise RuntimeError(f"render_offline failed:\n{r.stderr[-800:]}")
    return r.stdout.strip().splitlines()[-1]


def midi_summary(path: Path) -> dict:
    import mido
    m = mido.MidiFile(path)
    pitched = drums = 0
    for tr in m.tracks:
        for msg in tr:
            if msg.type == "note_on" and msg.velocity > 0:
                if msg.channel == 9:
                    drums += 1
                else:
                    pitched += 1
    return {"seconds": round(m.length, 2), "pitched_notes": pitched, "drum_hits": drums}


def main():
    ap = argparse.ArgumentParser()
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--code", help="Strudel code as a string")
    src.add_argument("--file", type=Path, help="path to a .js Strudel file")
    ap.add_argument("--cycles", type=int, default=4)
    ap.add_argument("--name", default=None, help="optional label in the folder name")
    ap.add_argument("--out-root", type=Path, default=REPO / "runs")
    args = ap.parse_args()

    code = args.code if args.code else Path(args.file).read_text()

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    folder = stamp + (f"-{args.name}" if args.name else "")
    run = (args.out_root / folder).resolve()
    run.mkdir(parents=True, exist_ok=True)
    print(f"run folder: {run}\n")

    manifest = {
        "timestamp": stamp,
        "input": {"source": str(args.file) if args.file else "inline --code"},
        "cycles": args.cycles,
        "models": {"transcriber": "YourMT3+ YPTF.MoE+Multi (noPS)",
                   "back_transform": "claude-haiku-4-5"},
        "stages": {},
    }

    # 1. input code + audio
    (run / "input.js").write_text(code.rstrip() + "\n")
    print("[1/5] rendering input Strudel -> input.wav")
    render_strudel(run / "input.js", run / "input.wav", args.cycles)

    # 2. transcribe input.wav -> MIDI (loads the model; chdir's internally)
    print("[2/5] transcribing with YourMT3+ -> transcribed.mid")
    from yourmt3_transcribe import load_model, transcribe_file
    model = load_model()
    transcribe_file(model, run / "input.wav", run / "transcribed.mid")
    manifest["stages"]["transcription"] = midi_summary(run / "transcribed.mid")

    # 3. MIDI -> audible WAV (so the transcription itself is listenable)
    print("[3/5] synthesizing transcribed.mid -> transcribed.wav")
    from midi_to_wav import render_midi_to_wav
    render_midi_to_wav(run / "transcribed.mid", run / "transcribed.wav")

    # 4. MIDI -> Strudel code via Haiku (validated against the engine)
    print("[4/5] regenerating Strudel from MIDI with Haiku 4.5 -> output.js")
    from midi_to_strudel import midi_to_strudel
    try:
        out_code = midi_to_strudel(run / "transcribed.mid", verbose=True)
        (run / "output.js").write_text(out_code + "\n")
        # 5. output audio
        print("[5/5] rendering output Strudel -> output.wav")
        render_strudel(run / "output.js", run / "output.wav", args.cycles)
        manifest["stages"]["back_transform"] = {"ok": True}
    except Exception as e:  # keep the run usable even if the LLM leg fails
        (run / "output.js").write_text(f"// back-transform failed:\n// {e}\n")
        manifest["stages"]["back_transform"] = {"ok": False, "error": str(e)}
        print(f"  ! back-transform failed: {e}")

    (run / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

    print(f"\nDone. {run}")
    for f in sorted(run.iterdir()):
        print(f"  {f.name}")


if __name__ == "__main__":
    main()
