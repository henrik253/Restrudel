#!/usr/bin/env python3
"""Track B B1 — remove the leak-tainted generated Strudel renders from Drive.

The synthetic songs (`dataset/batches/*`, `enhanced_all.yaml`) were purged from
git because they were sampled from distributions computed over the FULL corpus
(test files included). Their rendered artifacts on Drive must go too, so a later
`preprocess_strudel.py` run (B6) does not silently reuse leaked train data.

Safe by design: **dry-run unless `--apply` is passed.** Distinguishes generated
ids (`<seed>_<i>`, e.g. `1000_7`) from real-corpus ids (`corpus_<hash>`), and
only ever touches the generated ones. Run it in Colab with Drive mounted:

    python scripts/dataset/purge_generated_drive.py \
        --data-home /content/drive/MyDrive/restrudel/datasets           # dry-run
    python scripts/dataset/purge_generated_drive.py \
        --data-home /content/drive/MyDrive/restrudel/datasets --apply   # delete

What it does:
  1. render dirs:  <data-home>/strudel_yourmt3_16k/<id>/   -> rm generated ids
  2. index lists:  <data-home>/yourmt3_indexes/strudel_{train,validation,test}_file_list.json
                   -> drop entries whose strudel_id is generated, rewrite JSON
Real-corpus renders and their index entries are left completely untouched.
"""
import argparse
import json
import re
import shutil
import sys
from pathlib import Path

GENERATED_ID = re.compile(r"^\d+_\d+$")   # <seed>_<i>; corpus ids are corpus_<hash>


def is_generated(sid: str) -> bool:
    return bool(GENERATED_ID.match(sid))


def purge_renders(render_dir: Path, apply: bool):
    if not render_dir.is_dir():
        print(f"  (no render dir at {render_dir} — skipping)")
        return 0
    n = 0
    for d in sorted(render_dir.iterdir()):
        if d.is_dir() and is_generated(d.name):
            n += 1
            print(f"  {'RM ' if apply else 'would rm '}{d}")
            if apply:
                shutil.rmtree(d)
    print(f"  render dirs {'removed' if apply else 'to remove'}: {n}")
    return n


def purge_index(idx_dir: Path, apply: bool):
    if not idx_dir.is_dir():
        print(f"  (no index dir at {idx_dir} — skipping)")
        return 0
    total = 0
    for split in ("train", "validation", "test"):
        f = idx_dir / f"strudel_{split}_file_list.json"
        if not f.exists():
            continue
        doc = json.load(open(f))
        # YourMT3 file lists are {"<index>": {entry}, ...} or a bare list.
        if isinstance(doc, dict):
            items = list(doc.values())
            kept = {}
            dropped = 0
            new_i = 0
            for v in items:
                sid = str(v.get("strudel_id", v.get("mtrack_id", "")))
                if is_generated(sid):
                    dropped += 1
                else:
                    kept[str(new_i)] = v
                    new_i += 1
            out = kept
        else:  # list
            kept_list = [v for v in doc
                         if not is_generated(str(v.get("strudel_id", "")))]
            dropped = len(doc) - len(kept_list)
            out = kept_list
        total += dropped
        print(f"  {f.name}: {'dropped' if apply else 'would drop'} {dropped} generated entries")
        if apply and dropped:
            json.dump(out, open(f, "w"), indent=2)
    print(f"  index entries {'dropped' if apply else 'to drop'}: {total}")
    return total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-home", required=True,
                    help="e.g. /content/drive/MyDrive/restrudel/datasets")
    ap.add_argument("--apply", action="store_true",
                    help="actually delete (default: dry-run)")
    args = ap.parse_args()
    home = Path(args.data_home)
    if not home.is_dir():
        sys.exit(f"data-home not found: {home}")

    mode = "APPLY (deleting)" if args.apply else "DRY-RUN (nothing deleted)"
    print(f"== purge generated Strudel renders — {mode} ==")
    print("[1/2] render dirs")
    purge_renders(home / "strudel_yourmt3_16k", args.apply)
    print("[2/2] index file lists")
    purge_index(home / "yourmt3_indexes", args.apply)
    if not args.apply:
        print("\nre-run with --apply to delete. Corpus (corpus_*) renders are never touched.")


if __name__ == "__main__":
    main()
