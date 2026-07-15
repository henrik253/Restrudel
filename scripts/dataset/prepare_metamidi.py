#!/usr/bin/env python3
"""Fetch electronic-genre MIDI (MetaMIDI / GigaMIDI) as render feedstock.

MetaMIDI (436k files, 143k genre-tagged, CC BY 4.0) and its successor GigaMIDI
carry genre metadata, so we can select electronic/EDM/techno/house tracks
directly — a higher-hit-rate feedstock than filtering Lakh by GM program (Track
B B3, docs/external_electronic_data_B3.md). This selects those MIDIs into a
staging dir; audio comes later from scripts/dataset/render_synths.py (real
synths) — this script does NOT render.

>>> COLAB-run. Prefers GigaMIDI via `datasets` (open on HuggingFace); MetaMIDI
Zenodo access may require a request form (flagged). <<<

Usage (Colab):
  pip install datasets mido
  python scripts/dataset/prepare_metamidi.py --data-home $DATA_HOME --limit 2000
"""
import argparse
import sys
from pathlib import Path

ELECTRONIC = {"electronic", "edm", "techno", "house", "trance", "dance",
              "dubstep", "drum-and-bass", "dnb", "synth", "electro", "ambient"}


def is_electronic(genres) -> bool:
    if not genres:
        return False
    if isinstance(genres, str):
        genres = [genres]
    return any(g and any(e in str(g).lower() for e in ELECTRONIC) for g in genres)


def from_gigamidi(out_dir: Path, limit: int) -> int:
    """Stream GigaMIDI from HuggingFace and keep electronic-tagged entries."""
    from datasets import load_dataset
    ds = load_dataset("Metacreation/GigaMIDI", split="train", streaming=True)
    n = 0
    for rec in ds:
        genres = rec.get("genre") or rec.get("genres") or rec.get("tags")
        if not is_electronic(genres):
            continue
        data = rec.get("midi") or rec.get("music") or rec.get("bytes")
        mid_id = str(rec.get("md5") or rec.get("id") or n)
        if isinstance(data, dict) and "bytes" in data:
            data = data["bytes"]
        if not isinstance(data, (bytes, bytearray)):
            continue
        (out_dir / f"{mid_id}.mid").write_bytes(data)
        n += 1
        if n % 200 == 0:
            print(f"  kept {n} electronic MIDIs")
        if limit and n >= limit:
            break
    return n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-home", type=Path, required=True)
    ap.add_argument("--limit", type=int, default=2000)
    args = ap.parse_args()

    out_dir = args.data_home / "metamidi_electronic"
    out_dir.mkdir(parents=True, exist_ok=True)
    existing = len(list(out_dir.glob("*.mid")))
    if existing >= (args.limit or 1):
        print(f"{out_dir} already has {existing} MIDIs — skipping")
        return
    try:
        n = from_gigamidi(out_dir, args.limit)
    except Exception as e:
        sys.exit(f"GigaMIDI fetch failed ({type(e).__name__}: {e}). "
                 f"For MetaMIDI, request access at zenodo.org/records/5142664, "
                 f"download, and drop electronic-genre .mid files into {out_dir}.")
    print(f"staged {n} electronic MIDIs -> {out_dir}\n"
          f"next: render them via scripts/dataset/render_synths.py (real synths).")


if __name__ == "__main__":
    main()
