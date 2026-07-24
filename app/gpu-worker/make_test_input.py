#!/usr/bin/env python3
"""Write a RunPod `test_input.json` from a WAV (or a synthesized fallback).

RunPod's local mode (`python handler.py` with no args inside the container, or
`--rp_serve_api`) picks up `test_input.json` automatically. It is not committed
because a base64 WAV is bulk the repo does not need.

    python make_test_input.py                     # 4 s synthesized arpeggio
    python make_test_input.py -i snippet.wav      # from a real 16 kHz mono WAV
"""
from __future__ import annotations

import argparse
import base64
import json
import math
import struct
import wave
from io import BytesIO
from pathlib import Path

SAMPLE_RATE = 16_000


def synth_wav(seconds: float = 4.0) -> bytes:
    """A simple 4-note arpeggio — enough to prove the plumbing end to end."""
    notes = [261.63, 329.63, 392.00, 523.25]  # C4 E4 G4 C5
    per_note = seconds / len(notes)
    frames = bytearray()
    for freq in notes:
        n = int(SAMPLE_RATE * per_note)
        for i in range(n):
            env = min(1.0, i / 200) * max(0.0, 1.0 - i / n)  # click-free attack/decay
            frames += struct.pack("<h", int(12000 * env * math.sin(2 * math.pi * freq * i / SAMPLE_RATE)))

    buf = BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(bytes(frames))
    return buf.getvalue()


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("-i", "--input", type=Path, help="16 kHz mono WAV (default: synthesize)")
    ap.add_argument("-o", "--out", type=Path, default=Path(__file__).parent / "test_input.json")
    ap.add_argument("-m", "--model-version", default=None,
                    help="omit to let the worker use its configured default")
    args = ap.parse_args()

    audio = args.input.read_bytes() if args.input else synth_wav()
    payload = {"input": {"audio_b64": base64.b64encode(audio).decode()}}
    if args.model_version:
        payload["input"]["model_version"] = args.model_version
    args.out.write_text(json.dumps(payload))
    print(f"{args.out} written ({len(audio)} bytes of audio"
          f"{' from ' + str(args.input) if args.input else ', synthesized'})")
