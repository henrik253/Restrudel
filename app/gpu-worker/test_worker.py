#!/usr/bin/env python3
"""Worker tests that need no GPU, no checkpoint and no RunPod account.

Covers the parts that break silently in production: input validation, model
resolution (including the model.json override that makes checkpoints swappable),
and tempo estimation. Model inference itself is exercised by
`handler.py --audio <wav>` against a real checkpoint.

    python test_worker.py        # from app/gpu-worker/
"""
from __future__ import annotations

import base64
import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import model_registry  # noqa: E402
from make_test_input import synth_wav  # noqa: E402

PASS: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    if cond:
        PASS.append(name)
        print(f"  ok   {name}")
    else:
        print(f"  FAIL {name} {detail}")
        raise SystemExit(1)


def test_input_validation() -> None:
    print("input validation")
    import handler

    def err(payload) -> str:
        out = handler.handler({"input": payload})
        return out.get("error", "")

    check("missing audio_b64 rejected", "audio_b64 is required" in err({}))
    check("non-base64 rejected", "not valid base64" in err({"audio_b64": "!!!not base64!!!"}))
    check("empty audio_b64 rejected", "audio_b64 is required" in err({"audio_b64": ""}))
    check("wrong type rejected", "audio_b64 is required" in err({"audio_b64": 42}))
    non_wav = base64.b64encode(b"this is not a wav file at all").decode()
    check("non-WAV rejected", "RIFF" in err({"audio_b64": non_wav}))
    big = base64.b64encode(b"RIFF" + b"\0" * (handler.MAX_AUDIO_BYTES + 1)).decode()
    check("oversized audio rejected", "over the" in err({"audio_b64": big}))
    check("errors are reported, not raised",
          isinstance(handler.handler({"input": {}}), dict))


def test_model_resolution() -> None:
    print("model resolution (swappability)")
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)

        try:
            model_registry.resolve("nope", root)
            check("missing version raises", False)
        except FileNotFoundError as exc:
            check("missing version raises FileNotFoundError", "not found" in str(exc))

        # A bare directory + last.ckpt is enough — defaults fill in the rest.
        plain = root / "v2mix_s42-20260722"
        plain.mkdir()
        (plain / "last.ckpt").write_bytes(b"stub")
        spec = model_registry.resolve("v2mix_s42-20260722", root)
        check("defaults applied", spec.arch == model_registry.DEFAULT_ARCH
              and spec.project == "ymt3")
        check("exp_id defaults to dir name", spec.exp_id == "v2mix_s42-20260722")
        check("load_args carries checkpoint + precision",
              spec.load_args()[0].endswith("@last.ckpt") and "-pr" in spec.load_args())

        # model.json overrides everything — a future model with a different
        # architecture deploys without a code change.
        custom = root / "future-model"
        custom.mkdir()
        (custom / "last.ckpt").write_bytes(b"stub")
        (custom / "model.json").write_text(json.dumps({
            "exp_id": "ft_something_else", "project": "ymt4",
            "arch": ["-tk", "some_other_vocab"], "precision": "16-mixed",
        }))
        spec = model_registry.resolve("future-model", root)
        check("model.json overrides arch", spec.arch == ["-tk", "some_other_vocab"])
        check("model.json overrides exp_id/project",
              spec.exp_id == "ft_something_else" and spec.project == "ymt4")
        check("model.json overrides precision", spec.precision == "16-mixed")

        missing_ckpt = root / "no-ckpt"
        missing_ckpt.mkdir()
        try:
            model_registry.resolve("no-ckpt", root)
            check("missing last.ckpt raises", False)
        except FileNotFoundError as exc:
            check("missing last.ckpt raises", "last.ckpt" in str(exc))


def test_tempo_estimation() -> None:
    print("tempo estimation")
    try:
        import librosa  # noqa: F401
    except ImportError:
        print("  skip (librosa not installed)")
        return
    import inference

    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "a.wav"
        wav.write_bytes(synth_wav(4.0))
        out = inference.estimate_tempo(wav)

    check("tempo keys present",
          {"tempo_bpm", "beats_s", "downbeats_s", "meter_assumed"} <= set(out))
    check("beats are ascending seconds",
          all(b2 > b1 for b1, b2 in zip(out["beats_s"], out["beats_s"][1:])))
    check("downbeats are every 4th beat (4/4)",
          out["downbeats_s"] == out["beats_s"][::4])
    check("tempo is plausible or None",
          out["tempo_bpm"] is None or 20 < out["tempo_bpm"] < 300,
          f"got {out['tempo_bpm']}")


if __name__ == "__main__":
    test_input_validation()
    test_model_resolution()
    test_tempo_estimation()
    print(f"\n{len(PASS)} checks passed")
