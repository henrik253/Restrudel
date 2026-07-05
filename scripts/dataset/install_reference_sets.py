#!/usr/bin/env python3
"""Install YourMT3's preprocessed reference datasets (Slakh, MAESTRO, EGMD).

These are the forgetting-mitigation sets: fine-tuning batches should mix them
in alongside the Strudel data so the model keeps its general transcription
ability. YourMT3 hosts ready-made 16 kHz versions (Zenodo / mirdata), already
in the exact training format — no conversion needed, just download + their own
preprocessing. This wraps their interactive install_dataset.py so it runs
non-interactively into our --data-home.

Approx. archive sizes (verified via Zenodo): slakh ~30 GB, maestro ~19 GB,
egmd ~36 GB. Extraction needs ~2x the archive size free on --data-home's disk.

Usage:
  .venv/bin/python scripts/dataset/install_reference_sets.py --sets egmd
  .venv/bin/python scripts/dataset/install_reference_sets.py --sets slakh,maestro,egmd
"""
import argparse
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-home", type=Path, default=REPO / "datasets")
    ap.add_argument("--amt-src", type=Path, default=REPO / "models" / "YourMT3" / "amt" / "src")
    ap.add_argument("--sets", default="slakh,maestro,egmd",
                    help="comma-separated: slakh, maestro, egmd")
    ap.add_argument("--nodown", action="store_true",
                    help="skip downloading (re-run preprocessing only)")
    args = ap.parse_args()

    if not args.amt_src.exists():
        sys.exit(f"amt/src not found at {args.amt_src} — run scripts/fetch_yourmt3.py")
    sys.path.insert(0, str(args.amt_src))
    import install_dataset  # noqa: E402  (their module; imports its own deps)

    args.data_home.mkdir(parents=True, exist_ok=True)
    installers = {
        "slakh": install_dataset.install_slakh,      # 2100 multitrack songs (mirdata)
        "maestro": install_dataset.install_maestro,  # ~200h piano (Zenodo)
        "egmd": install_dataset.install_egmd,        # electronic drum kit (Zenodo)
    }
    for name in args.sets.split(","):
        name = name.strip()
        if name not in installers:
            sys.exit(f"unknown set '{name}' (choose from {sorted(installers)})")
        print(f"=== installing {name} into {args.data_home} ===")
        installers[name](str(args.data_home), no_down=args.nodown)
        print(f"=== {name} done ===\n")


if __name__ == "__main__":
    main()
