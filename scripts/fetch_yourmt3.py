#!/usr/bin/env python3
"""Fetch YourMT3+ code + one checkpoint into models/YourMT3 (gitignored).

Code comes from the HF Space (mimbres/YourMT3, amt/src). The checkpoint is the
YPTF.MoE+Multi (noPS) variant — the one the official demo uses — from the
model repo (mimbres/YourMT3). The Space expects checkpoints under
amt/logs/2024/<exp_tag>/checkpoints/, so we mirror that layout.
"""
from pathlib import Path

from huggingface_hub import snapshot_download

ROOT = Path(__file__).resolve().parent.parent / "models" / "YourMT3"
EXP_TAG = "mc13_256_g4_all_v7_mt3f_sqr_rms_moe_wf4_n8k2_silu_rope_rp_b36_nops"

# 1) code (small): amt/src from the Space
snapshot_download(
    repo_id="mimbres/YourMT3",
    repo_type="space",
    allow_patterns=["amt/src/**", "amt/src/*"],
    local_dir=ROOT,
)

# 2) checkpoint (~1 GB): only the noPS MoE variant from the model repo
snapshot_download(
    repo_id="mimbres/YourMT3",
    repo_type="model",
    allow_patterns=[f"logs/2024/{EXP_TAG}/**"],
    local_dir=ROOT / "amt",
)

print("Done:", ROOT)
