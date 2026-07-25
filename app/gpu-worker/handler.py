"""RunPod Serverless entrypoint for the Restrudel transcription worker.

Contract (docs/application_architecture.md, roadmap A1):

  input   {"audio_b64": "<16 kHz mono WAV>", "model_version": "v2mix_s42-20260722"}
  output  {"events": [{onset_s, offset_s, pitch, velocity, program, is_drum}],
           "tempo_bpm", "beats_s", "downbeats_s", "model_version", "timings"}

`model_version` is optional; it selects a directory under the checkpoint root
(see model_registry.py). Swapping models is a volume upload + an env change.

Local smoke test (no GPU, no RunPod account):

    CHECKPOINT_ROOT=/path/to/checkpoints YOURMT3_ROOT=/path/to/models/YourMT3 \
      python handler.py --test-input test_input.json
"""
from __future__ import annotations

import base64
import binascii
import json
import os
import tempfile
import traceback
from pathlib import Path

import inference
from model_registry import DEFAULT_MODEL_VERSION

# A snippet is 3–10 s of 16 kHz mono PCM16 (~320 KB); allow headroom but refuse
# anything that is obviously not a snippet before it reaches the GPU.
MAX_AUDIO_BYTES = int(os.environ.get("MAX_AUDIO_BYTES", 8 * 1024 * 1024))


class InputError(ValueError):
    """Bad request — reported back as an error, not retried."""


def _decode_audio(payload: dict) -> bytes:
    b64 = payload.get("audio_b64")
    if not b64 or not isinstance(b64, str):
        raise InputError("input.audio_b64 is required (base64-encoded 16 kHz mono WAV)")
    try:
        raw = base64.b64decode(b64, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise InputError(f"input.audio_b64 is not valid base64: {exc}") from exc
    if not raw:
        raise InputError("input.audio_b64 decoded to zero bytes")
    if len(raw) > MAX_AUDIO_BYTES:
        raise InputError(f"audio is {len(raw)} bytes, over the {MAX_AUDIO_BYTES} limit")
    if raw[:4] != b"RIFF":
        raise InputError("audio must be a WAV file (missing RIFF header)")
    return raw


def run(payload: dict) -> dict:
    """Pure function over the input dict — the unit the tests exercise."""
    audio = _decode_audio(payload)
    model_version = payload.get("model_version") or DEFAULT_MODEL_VERSION

    with tempfile.TemporaryDirectory(prefix="restrudel-") as tmp:
        wav_path = Path(tmp) / "snippet.wav"
        wav_path.write_bytes(audio)
        result = inference.transcribe(wav_path, model_version=model_version)

    result["timings"]["audio_bytes"] = len(audio)
    return result


def handler(job: dict) -> dict:
    """RunPod job handler. Raising marks the job FAILED with the message."""
    try:
        return run(job.get("input") or {})
    except InputError as exc:
        print(f"[handler] bad input: {exc}", flush=True)
        return {"error": str(exc), "error_type": "input"}
    except Exception as exc:  # noqa: BLE001 — surface the traceback in RunPod logs
        traceback.print_exc()
        return {"error": f"{type(exc).__name__}: {exc}", "error_type": "worker"}


def _preload() -> None:
    """Load the default checkpoint at container start.

    This is what makes warm requests fast: a cold container pays the ~30 s model
    load once, here, instead of inside the first user's request. Failure is not
    fatal — the first request retries and reports a real error.
    """
    if os.environ.get("PRELOAD_MODEL", "1") != "1":
        return
    try:
        inference.load_model()
    except Exception as exc:  # noqa: BLE001
        print(f"[handler] preload skipped: {type(exc).__name__}: {exc}", flush=True)


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--test-input", type=Path,
                    help="run one job from a JSON file and print the result (no RunPod)")
    ap.add_argument("--audio", type=Path, help="run directly on a WAV file")
    ap.add_argument("--model-version", default=None)
    ap.add_argument("-o", "--out", type=Path, help="write the result JSON here")
    args, _unknown = ap.parse_known_args()

    if args.test_input or args.audio:
        if args.audio:
            job = {"input": {"audio_b64": base64.b64encode(args.audio.read_bytes()).decode(),
                             "model_version": args.model_version}}
        else:
            job = json.loads(args.test_input.read_text())
            if args.model_version:
                job.setdefault("input", {})["model_version"] = args.model_version
        out = handler(job)
        summary = {k: v for k, v in out.items() if k != "events"}
        summary["event_count"] = len(out.get("events", []))
        print(json.dumps(summary, indent=2))
        if args.out:
            args.out.write_text(json.dumps(out, indent=2))
            print(f"full result -> {args.out}")
        raise SystemExit(0 if "error" not in out else 1)

    _preload()
    import runpod  # imported late so local runs need no RunPod SDK

    runpod.serverless.start({"handler": handler})
