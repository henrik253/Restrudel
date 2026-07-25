"""Model resolution — the seam that makes checkpoints swappable without code changes.

A `model_version` is a directory name under the checkpoint root (on RunPod:
`/runpod-volume/checkpoints/<model_version>/`). Deploying a new model means
uploading a directory and pointing `MODEL_VERSION` at it — nothing here changes.

Layout of a model directory:

    <checkpoint_root>/<model_version>/
      last.ckpt      required — the Lightning checkpoint
      model.json     optional — overrides for anything below

`model.json` exists so a future checkpoint with a *different architecture* still
needs no code change:

    {"exp_id": "ft_v2mix_s42_20260722-050418",
     "project": "ymt3",
     "arch": ["-tk", "mc13_full_plus_256", ...],   # full flag list, replaces DEFAULT_ARCH
     "precision": "bf16-mixed"}

Every field is optional; omitted fields fall back to the defaults below, which
describe the YourMT3+ `mc13_256` family we fine-tune today (v2mix, strudel50,
egmd50 and the released base all share it).
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path

# Architecture flags of the mc13_256 YourMT3+ family. Verified identical across
# notebooks 05/06 (ARCH) and scripts/yourmt3_transcribe.py.
DEFAULT_ARCH: list[str] = [
    "-tk", "mc13_full_plus_256", "-dec", "multi-t5", "-nl", "26",
    "-enc", "perceiver-tf", "-sqr", "1", "-ff", "moe", "-wf", "4",
    "-nmoe", "8", "-kmoe", "2", "-act", "silu", "-epe", "rope", "-rp", "1",
    "-ac", "spec", "-hop", "300", "-atc", "1",
]

DEFAULT_PROJECT = "ymt3"
DEFAULT_MODEL_VERSION = os.environ.get("MODEL_VERSION", "v2mix_s42-20260722")

# On RunPod a network volume mounts at /runpod-volume; locally, point
# CHECKPOINT_ROOT at any directory with the same layout.
CHECKPOINT_ROOT = Path(os.environ.get("CHECKPOINT_ROOT", "/runpod-volume/checkpoints"))


@dataclass(frozen=True)
class ModelSpec:
    """Everything needed to load one checkpoint."""

    version: str
    ckpt_path: Path
    exp_id: str
    project: str = DEFAULT_PROJECT
    arch: list[str] = field(default_factory=lambda: list(DEFAULT_ARCH))
    precision: str = "bf16-mixed"

    def load_args(self, checkpoint_name: str = "last.ckpt") -> list[str]:
        """Argv for YourMT3's `load_model_checkpoint`."""
        return [f"{self.exp_id}@{checkpoint_name}", "-p", self.project,
                *self.arch, "-pr", self.precision]


def resolve(model_version: str | None = None,
            checkpoint_root: Path | None = None) -> ModelSpec:
    """model_version -> ModelSpec, applying model.json overrides if present."""
    version = model_version or DEFAULT_MODEL_VERSION
    root = Path(checkpoint_root or CHECKPOINT_ROOT)
    model_dir = root / version

    if not model_dir.is_dir():
        available = sorted(p.name for p in root.iterdir() if p.is_dir()) if root.is_dir() else []
        raise FileNotFoundError(
            f"model_version {version!r} not found at {model_dir}. "
            f"Available: {available or '(checkpoint root missing)'}"
        )

    ckpt = model_dir / "last.ckpt"
    if not ckpt.exists():
        raise FileNotFoundError(f"{ckpt} missing — a model directory needs last.ckpt")

    overrides = {}
    meta_path = model_dir / "model.json"
    if meta_path.exists():
        overrides = json.loads(meta_path.read_text())

    # exp_id only matters because YourMT3 resolves checkpoints through a
    # logs/<project>/<exp_id>/checkpoints/ layout; default to the directory name.
    return ModelSpec(
        version=version,
        ckpt_path=ckpt,
        exp_id=overrides.get("exp_id", version),
        project=overrides.get("project", DEFAULT_PROJECT),
        arch=list(overrides.get("arch", DEFAULT_ARCH)),
        precision=overrides.get("precision", "bf16-mixed"),
    )
