#!/usr/bin/env python3
"""Transcribe an audio file to MIDI with YourMT3+ (YPTF.MoE+Multi noPS).

Wraps the model_helper.py flow from the official HF Space. Expects the model
code + checkpoint under models/YourMT3 (see scripts/fetch_yourmt3.py).

Usage: .venv/bin/python scripts/yourmt3_transcribe.py input.wav [-o out.mid]
"""
import argparse
import os
import shutil
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MODEL_ROOT = REPO / "models" / "YourMT3"
sys.path.append(str(MODEL_ROOT / "amt" / "src"))
sys.path.append(str(MODEL_ROOT))

CHECKPOINT_ARGS = [
    "mc13_256_g4_all_v7_mt3f_sqr_rms_moe_wf4_n8k2_silu_rope_rp_b36_nops@last.ckpt",
    "-p", "2024",
    "-tk", "mc13_full_plus_256", "-dec", "multi-t5", "-nl", "26",
    "-enc", "perceiver-tf", "-sqr", "1", "-ff", "moe", "-wf", "4",
    "-nmoe", "8", "-kmoe", "2", "-act", "silu", "-epe", "rope", "-rp", "1",
    "-ac", "spec", "-hop", "300", "-atc", "1",
    "-pr", "32",  # fp32: safe on CPU/MPS (the Space uses fp16 on CUDA)
]


def load_model():
    # initialize_trainer resolves logs/<project>/<exp_id> relative to cwd/amt
    os.chdir(MODEL_ROOT)
    from model_helper import load_model_checkpoint

    return load_model_checkpoint(args=CHECKPOINT_ARGS, device="cpu")


def transcribe_file(model, audio_path: Path, out_path: Path) -> Path:
    from model_helper import transcribe

    audio_path = audio_path.resolve()
    out_path = out_path.resolve()
    midifile = transcribe(model, {
        "filepath": str(audio_path),
        "track_name": audio_path.stem,
    })
    out_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(midifile, out_path)
    return out_path


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("audio", type=Path)
    ap.add_argument("-o", "--out", type=Path, default=None)
    args = ap.parse_args()
    out = args.out or args.audio.with_suffix(".mid")

    model = load_model()
    result = transcribe_file(model, args.audio, out)
    print(f"MIDI written: {result}")
