#!/usr/bin/env python3
"""Fetch electronic-genre MIDI (GigaMIDI / MetaMIDI) as render feedstock.

GigaMIDI (successor to MetaMIDI) carries genre metadata, so we can select
electronic/EDM/techno/house tracks directly — a higher-hit-rate feedstock than
filtering Lakh by GM program (Track B B3, docs/roadmap.md Phase 8 B3).
This selects those MIDIs into a staging dir; audio comes later from
scripts/dataset/render_synths.py (real synths) — this script does NOT render.

Schema verified against the live dataset 2026-07-17 (an earlier version guessed
`genre`/`genres`/`tags`/`midi`, none of which exist — the filter silently kept
nothing). The real record:
  md5                 str    -> the file id
  music               bytes  -> the MIDI itself
  genres_curated      str  | None      e.g. "electronic---house"
  genres_scraped      str  | None      e.g. "['pop']" (stringified list)
  genres_{discogs,tagtraum,lastfm}     {"genre": [...], "count": [...]}
  instrument_category str    e.g. "all-instruments-with-drums"
Roughly 1 in 5 records carries an electronic-ish tag, so expect to stream ~5x
`--limit` records.

>>> The dataset is GATED: accept its terms on the Hub, then `hf auth login`
(or set HF_TOKEN). Without that, `load_dataset` raises and we say so. <<<

Usage:
  python scripts/dataset/prepare_metamidi.py --data-home $DATA_HOME --limit 2000
"""
import argparse
import sys
from pathlib import Path

GIGAMIDI_REPO = "Metacreation/GigaMIDI"
# Genre metadata sources on a GigaMIDI record: free-text fields, then the
# aggregated {"genre": [...], "count": [...]} dicts.
GENRE_TEXT_FIELDS = ("genres_curated", "genres_scraped")
GENRE_DICT_FIELDS = ("genres_discogs", "genres_tagtraum", "genres_lastfm")
# Substring-matched against every tag: values look like "electronic---trance".
ELECTRONIC = {"electronic", "edm", "techno", "house", "trance", "dance",
              "dubstep", "drum-and-bass", "dnb", "synth", "electro", "ambient"}
# If nothing carries a genre in this many records, the schema drifted again —
# fail loudly instead of streaming the whole corpus and staging zero files.
SCHEMA_PROBE_RECORDS = 200


def genres_of(rec) -> list:
    """Every genre tag on a record, across all metadata sources."""
    out = []
    for field in GENRE_TEXT_FIELDS:
        value = rec.get(field)
        if value:
            out.append(str(value))
    for field in GENRE_DICT_FIELDS:
        value = rec.get(field)
        if isinstance(value, dict):
            out.extend(str(g) for g in (value.get("genre") or []))
    return out


def is_electronic(genres) -> bool:
    return any(any(e in g.lower() for e in ELECTRONIC) for g in genres)


def from_gigamidi(out_dir: Path, limit: int) -> int:
    """Stream GigaMIDI and keep electronic-tagged entries."""
    from datasets import load_dataset

    dataset = load_dataset(GIGAMIDI_REPO, split="train", streaming=True)
    kept = seen = with_genre = 0
    for rec in dataset:
        seen += 1
        genres = genres_of(rec)
        with_genre += bool(genres)
        if seen == SCHEMA_PROBE_RECORDS and not with_genre:
            sys.exit(f"no genre metadata in the first {seen} records — the "
                     f"{GIGAMIDI_REPO} schema changed; re-check the field names "
                     f"in this script's docstring against a live record.")
        if not is_electronic(genres):
            continue
        data = rec.get("music")
        if not isinstance(data, (bytes, bytearray)):
            continue
        (out_dir / f"{rec['md5']}.mid").write_bytes(data)
        kept += 1
        if kept % 200 == 0:
            print(f"  kept {kept} electronic MIDIs (scanned {seen})", flush=True)
        if limit and kept >= limit:
            break
    print(f"scanned {seen} records; {with_genre} carried genre tags")
    return kept


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
        sys.exit(f"GigaMIDI fetch failed ({type(e).__name__}: {e}). It is a "
                 f"GATED dataset: accept the terms at "
                 f"huggingface.co/datasets/{GIGAMIDI_REPO} and run 'hf auth "
                 f"login'. For MetaMIDI instead, request access at "
                 f"zenodo.org/records/5142664 and drop electronic-genre .mid "
                 f"files into {out_dir}.")
    print(f"staged {n} electronic MIDIs -> {out_dir}\n"
          f"next: render them via scripts/dataset/render_synths.py (real synths).")


if __name__ == "__main__":
    main()
