#!/usr/bin/env python3
"""A/B: does stem separation before transcription help?

    input.mp3 ──┬─ transcribe the mix directly ─────────────────► mix events
                └─ demucs htdemucs (drums/bass/other/vocals)
                     └─ peak-normalize each stem ─ transcribe each ─► stem events
                                                                      + "merged"

Reuses the GPU worker's inference module (app/gpu-worker) so numbers transfer
1:1 to production, and applies the same −1 dBFS peak normalization the backend
cut uses (PR #15) to the mix and to every stem — separation quality must not be
confounded with clipping.

Demucs lives in its own venv (`.venv-demucs`, created with
`uv venv .venv-demucs && uv pip install --python .venv-demucs/bin/python demucs`)
and is invoked as a subprocess: its torch pins never touch the main venv.

Usage (from the repo root, main venv):
    .venv/bin/python scripts/stem_split_experiment.py INPUT.(mp3|wav) \
        [-o OUT_DIR] [--model v2mix_s42-20260722] [--start 12 --end 22]

Writes per variant (mix, drums, bass, other, vocals, merged):
    <out>/<variant>.wav          what the model actually heard (listen to it!)
    <out>/<variant>.events.json  contract-shaped note events
    <out>/<variant>.mid          quick listening copy of the transcription
and prints a comparison table.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from collections import Counter
from pathlib import Path

import numpy as np
import soundfile as sf

STEMS = ["drums", "bass", "other", "vocals"]
TARGET_PEAK = 10 ** (-1 / 20)  # −1 dBFS, mirrors app/backend/src/lib/audio.mjs
MAX_BOOST = 10


def find_main_root() -> Path:
    """The checkout that has models/YourMT3 + .venv-demucs (worktrees do not)."""
    here = Path(__file__).resolve().parents[1]
    for cand in (here, here.parents[2] if len(here.parents) > 2 else here):
        if (cand / "models" / "YourMT3").is_dir():
            return cand
    sys.exit("models/YourMT3 not found — run scripts/fetch_yourmt3.py first")


def run_demucs(main_root: Path, input_wav: Path, out_dir: Path) -> dict[str, Path]:
    demucs_bin = main_root / ".venv-demucs" / "bin" / "demucs"
    if not demucs_bin.exists():
        sys.exit(f"{demucs_bin} missing — see the module docstring for setup")
    t0 = time.time()
    subprocess.run(
        [str(demucs_bin), "-n", "htdemucs", "-d", "cpu", "-o", str(out_dir), str(input_wav)],
        check=True,
    )
    print(f"[demucs] separated in {time.time() - t0:.0f}s")
    stem_dir = out_dir / "htdemucs" / input_wav.stem
    return {s: stem_dir / f"{s}.wav" for s in STEMS}


def normalized_copy(src: Path, dst: Path) -> None:
    """Mono float WAV at the source rate, peak-normalized to −1 dBFS (boost
    capped ×10) — the same gain staging the backend applies to snippets."""
    data, sr = sf.read(str(src), dtype="float32", always_2d=True)
    mono = data.mean(axis=1)
    peak = float(np.abs(mono).max()) if mono.size else 0.0
    gain = min(TARGET_PEAK / peak, MAX_BOOST) if peak > 0 else 1.0
    sf.write(str(dst), mono * gain, sr)


def write_midi(events: list[dict], path: Path, bpm: float = 120.0) -> None:
    """Listening copy: pitched notes on per-program channels, drums on ch 10."""
    import mido

    mid = mido.MidiFile(ticks_per_beat=480)
    track = mido.MidiTrack()
    mid.tracks.append(track)
    track.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(bpm), time=0))

    def ticks(sec: float) -> int:
        return round(sec * bpm / 60 * 480)

    programs = sorted({e["program"] for e in events if not e["is_drum"]})
    chan = {p: min(i if i < 9 else i + 1, 15) for i, p in enumerate(programs)}
    msgs = []
    for p in programs:
        msgs.append((0, mido.Message("program_change", channel=chan[p], program=min(p, 127))))
    for e in events:
        ch = 9 if e["is_drum"] else chan[e["program"]]
        msgs.append((ticks(e["onset_s"]), mido.Message(
            "note_on", channel=ch, note=e["pitch"], velocity=e["velocity"])))
        msgs.append((ticks(e["offset_s"]), mido.Message(
            "note_off", channel=ch, note=e["pitch"], velocity=0)))
    msgs.sort(key=lambda m: m[0])
    at = 0
    for t, msg in msgs:
        track.append(msg.copy(time=t - at))
        at = t
    mid.save(str(path))


def summarize(name: str, events: list[dict]) -> dict:
    drums = [e for e in events if e["is_drum"]]
    pitched = [e for e in events if not e["is_drum"]]
    return {
        "variant": name,
        "events": len(events),
        "drum_events": len(drums),
        "pitched_events": len(pitched),
        "programs": sorted({e["program"] for e in pitched}),
        "drum_pitches": dict(Counter(e["pitch"] for e in drums).most_common(6)),
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("input", type=Path)
    ap.add_argument("-o", "--out", type=Path, default=None)
    ap.add_argument("--model", default="v2mix_s42-20260722")
    ap.add_argument("--start", type=float, default=None, help="cut window start (s)")
    ap.add_argument("--end", type=float, default=None, help="cut window end (s)")
    args = ap.parse_args()

    main_root = find_main_root()
    out = args.out or Path(f"stem_experiment_{args.input.stem}")
    out.mkdir(parents=True, exist_ok=True)

    # Canonical source: decoded (and optionally cut) to stereo float WAV once,
    # so demucs and the mix path see byte-identical audio.
    src = out / "source.wav"
    cut = []
    if args.start is not None and args.end is not None:
        cut = ["-ss", f"{args.start:.3f}", "-t", f"{args.end - args.start:.3f}"]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(args.input), *cut,
                    "-c:a", "pcm_f32le", str(src)], check=True)

    stems = run_demucs(main_root, src, out)

    # What the model hears: normalized mono copies of the mix and every stem.
    variants: dict[str, Path] = {}
    for name, wav in [("mix", src), *stems.items()]:
        norm = out / f"{name}.wav"
        normalized_copy(wav, norm)
        variants[name] = norm

    # Worker inference module — identical model path as production.
    os.environ.setdefault("YOURMT3_ROOT", str(main_root / "models" / "YourMT3"))
    os.environ.setdefault("CHECKPOINT_ROOT", str(main_root / "checkpoints"))
    sys.path.insert(0, str(main_root / "app" / "gpu-worker"))
    import inference  # noqa: E402

    model, spec = inference.load_model(args.model)
    print(f"[model] {spec.version} loaded")

    rows = []
    merged: list[dict] = []
    for name, wav in variants.items():
        t0 = time.time()
        events, errs = inference.transcribe_to_notes(model, wav)
        print(f"[transcribe] {name}: {len(events)} events in {time.time() - t0:.0f}s "
              f"(decode errors: {sum(errs.values()) if errs else 0})")
        (out / f"{name}.events.json").write_text(json.dumps(events, indent=1))
        write_midi(events, out / f"{name}.mid")
        rows.append(summarize(name, events))
        if name != "mix":
            merged += events

    merged.sort(key=lambda e: (e["onset_s"], e["pitch"]))
    (out / "merged.events.json").write_text(json.dumps(merged, indent=1))
    write_midi(merged, out / "merged.mid")
    rows.append(summarize("merged (stems)", merged))

    print(f"\n{'variant':<16}{'events':>8}{'drums':>8}{'pitched':>9}  programs / top drum pitches")
    for r in rows:
        print(f"{r['variant']:<16}{r['events']:>8}{r['drum_events']:>8}{r['pitched_events']:>9}"
              f"  {r['programs']} / {r['drum_pitches']}")
    print(f"\neverything written to {out}/ — listen to <stem>.wav vs <stem>.mid")


if __name__ == "__main__":
    main()
