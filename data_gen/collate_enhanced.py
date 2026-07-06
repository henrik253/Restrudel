#!/usr/bin/env python3
"""Collate enhanced per-song Strudel files into the inspired-songs YAML.

The enhancement agents (subagents, see data_gen/README.md) write one coherent
Strudel track per sketch to dataset/enhanced/<source_id>.js. This validates
every file against the real Strudel engine (extract_labels.mjs -> queryArc) and
assembles the ones that pass into dataset/generated_500_inspired.yaml, in the
exact shape preprocess_strudel.py consumes (id + code, plus lineage).

Usage:
  python data_gen/collate_enhanced.py
  python data_gen/collate_enhanced.py --dir dataset/enhanced --min-events 4
"""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent


def validate(code: str) -> tuple[bool, str]:
    r = subprocess.run(
        ["node", str(HERE / "extract_labels.mjs"), "--code", code, "--cycles", "2"],
        cwd=HERE, capture_output=True, text=True, timeout=120,
    )
    if r.returncode != 0:
        err = (r.stderr or r.stdout).strip().splitlines()
        return False, (err[-1] if err else "eval error")[:160]
    try:
        n = json.loads(r.stdout)["n_events"]
    except Exception:
        return False, "no label output"
    return True, str(n)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", type=Path, default=HERE.parent / "dataset" / "enhanced")
    ap.add_argument("--source", type=Path, default=HERE.parent / "dataset" / "generated_500.yaml")
    ap.add_argument("--output", type=Path, default=HERE.parent / "dataset" / "generated_500_inspired.yaml")
    ap.add_argument("--min-events", type=int, default=4)
    args = ap.parse_args()

    seeds = {str(s["id"]): s.get("seed") for s in
             yaml.safe_load(args.source.read_text())["songs"]}

    songs, bad = [], []
    for js in sorted(args.dir.glob("*.js"), key=lambda p: p.stem):
        sid = js.stem
        code = js.read_text(encoding="utf-8").strip()
        ok, detail = validate(code)
        if not ok or int(detail) < args.min_events:
            bad.append((sid, detail if ok else detail))
            continue
        voices = sum(1 for ln in code.splitlines() if ln.strip().startswith("$:"))
        songs.append({"id": f"inspired_{int(sid):03d}" if sid.isdigit() else f"inspired_{sid}",
                      "source_id": sid, "source_seed": seeds.get(sid),
                      "voices": voices, "events": int(detail), "code": code + "\n"})

    lines = ["generator: data_gen/enhance_samples.py (subagents) + collate_enhanced.py",
             "source: dataset/generated_500.yaml",
             f"count: {len(songs)}", "songs:"]
    for s in sorted(songs, key=lambda x: x["id"]):
        lines += [f"  - id: \"{s['id']}\"", f"    source_id: \"{s['source_id']}\"",
                  f"    source_seed: {s['source_seed']}", f"    voices: {s['voices']}",
                  "    code: |"]
        lines += [f"      {ln}" for ln in s["code"].splitlines()]
    args.output.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"collated {len(songs)} enhanced songs -> {args.output}")
    if bad:
        print(f"{len(bad)} rejected (failed validation):")
        for sid, d in bad[:15]:
            print(f"  {sid}: {d}")


if __name__ == "__main__":
    main()
