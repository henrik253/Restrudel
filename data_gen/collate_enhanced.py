#!/usr/bin/env python3
"""Collate enhanced per-song Strudel files into per-batch + aggregated YAML.

The enhancement agents (subagents, see data_gen/README.md) write one coherent
Strudel track per sketch to dataset/batches/batch_<N>/enhanced/<source_id>.js.
This validates every file against the real Strudel engine (extract_labels.mjs ->
queryArc) and assembles the ones that pass into that batch's enhanced.yaml, in
the exact shape preprocess_strudel.py consumes (id + code, plus lineage).

Layout (batch-first):
  dataset/batches/batch_<N>/sketches.yaml   raw sampled sketches (generate.mjs)
  dataset/batches/batch_<N>/enhanced/*.js   validated enhanced tracks (subagents)
  dataset/batches/batch_<N>/enhanced.yaml   collated enhanced songs for the batch
  dataset/enhanced_all.yaml                 all batches' enhanced songs (consumers)
  dataset/sketches_all.yaml                 all batches' raw sketches

Usage:
  python data_gen/collate_enhanced.py --batch 2          # collate one batch
  python data_gen/collate_enhanced.py --dir <d> --source <s> --output <o>
  python data_gen/collate_enhanced.py --all              # rebuild aggregated views
"""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
DATASET = HERE.parent / "dataset"
BATCHES = DATASET / "batches"


def validate(code: str) -> tuple[bool, str]:
    r = subprocess.run(
        ["node", str(HERE / "extract_labels.mjs"), "--code", code, "--cycles", "2"],
        cwd=HERE, capture_output=True, text=True, timeout=120,
    )
    if r.returncode != 0:
        err = (r.stderr or r.stdout).strip().splitlines()
        return False, (err[-1] if err else "eval error")[:160]
    try:
        # stdout carries strudel log lines before the JSON — parse from the first "{"
        n = json.loads(r.stdout[r.stdout.index("{"):])["n_events"]
    except Exception:
        return False, "no label output"
    return True, str(n)


def write_songs_yaml(output: Path, header_lines: list[str], songs: list[dict],
                     include_events: bool) -> None:
    lines = list(header_lines) + ["songs:"]
    for s in sorted(songs, key=lambda x: x["id"]):
        lines += [f"  - id: \"{s['id']}\"", f"    source_id: \"{s['source_id']}\"",
                  f"    source_seed: {s['source_seed']}", f"    voices: {s['voices']}"]
        if include_events and s.get("events") is not None:
            lines.append(f"    events: {s['events']}")
        lines.append("    code: |")
        lines += [f"      {ln}" for ln in s["code"].splitlines()]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines) + "\n", encoding="utf-8")


def collate_batch(enhanced_dir: Path, source: Path, output: Path, min_events: int) -> int:
    seeds = {str(s["id"]): s.get("seed") for s in
             yaml.safe_load(source.read_text())["songs"]}

    songs, bad = [], []
    for js in sorted(enhanced_dir.glob("*.js"), key=lambda p: p.stem):
        sid = js.stem
        code = js.read_text(encoding="utf-8").strip()
        ok, detail = validate(code)
        if not ok or int(detail) < min_events:
            bad.append((sid, detail))
            continue
        voices = sum(1 for ln in code.splitlines() if ln.strip().startswith("$:"))
        songs.append({"id": f"inspired_{int(sid):03d}" if sid.isdigit() else f"inspired_{sid}",
                      "source_id": sid, "source_seed": seeds.get(sid),
                      "voices": voices, "events": int(detail), "code": code + "\n"})

    write_songs_yaml(output,
                     ["generator: data_gen/enhance_samples.py (subagents) + collate_enhanced.py",
                      f"source: {source.relative_to(DATASET.parent)}",
                      f"count: {len(songs)}"],
                     songs, include_events=True)

    print(f"collated {len(songs)} enhanced songs -> {output}")
    if bad:
        print(f"{len(bad)} rejected (failed validation):")
        for sid, d in bad[:15]:
            print(f"  {sid}: {d}")
    return len(songs)


def aggregate_all() -> None:
    """Concatenate every batch's enhanced.yaml / sketches.yaml into the
    dataset-level aggregated files that downstream consumers read."""
    batch_dirs = sorted(BATCHES.glob("batch_*"), key=lambda p: p.name)

    enh_songs = []
    for bd in batch_dirs:
        eh = bd / "enhanced.yaml"
        if eh.exists():
            doc = yaml.safe_load(eh.read_text()) or {}
            enh_songs += doc.get("songs", [])
    write_songs_yaml(DATASET / "enhanced_all.yaml",
                     ["generator: data_gen/collate_enhanced.py --all",
                      "source: dataset/batches/*/enhanced.yaml",
                      f"batches: {sum(1 for b in batch_dirs if (b/'enhanced.yaml').exists())}",
                      f"count: {len(enh_songs)}"],
                     enh_songs, include_events=True)
    print(f"aggregated {len(enh_songs)} enhanced songs -> {DATASET/'enhanced_all.yaml'}")

    # sketches_all.yaml: concat raw sampled songs across batches (id + seed + code).
    sk_songs = []
    for bd in batch_dirs:
        sk = bd / "sketches.yaml"
        if not sk.exists():
            continue
        doc = yaml.safe_load(sk.read_text()) or {}
        sk_songs += doc.get("songs", [])
    lines = ["generator: data_gen/generate.mjs (all batches)",
             "source: dataset/batches/*/sketches.yaml",
             f"count: {len(sk_songs)}", "songs:"]
    for s in sk_songs:
        # id must stay quoted: YAML 1.1 treats "_" in bare scalars as a digit
        # separator, so an unquoted "1000_0" silently parses back as int 10000.
        lines += [f"  - id: \"{s['id']}\"", f"    seed: {s.get('seed')}",
                  f"    voices: {s.get('voices')}"]
        code = s.get("code") or ""
        if not code:
            lines.append('    code: ""')
            continue
        lines.append("    code: |")
        lines += [(f"      {ln}" if ln else "") for ln in code.splitlines()]
    (DATASET / "sketches_all.yaml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"aggregated {len(sk_songs)} sketches -> {DATASET/'sketches_all.yaml'}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--batch", type=int, help="collate dataset/batches/batch_<N>/")
    ap.add_argument("--dir", type=Path, help="enhanced .js directory (overrides --batch)")
    ap.add_argument("--source", type=Path, help="sketches.yaml for lineage/seeds")
    ap.add_argument("--output", type=Path, help="collated enhanced.yaml output")
    ap.add_argument("--all", action="store_true",
                    help="rebuild dataset/enhanced_all.yaml + sketches_all.yaml")
    ap.add_argument("--min-events", type=int, default=4)
    args = ap.parse_args()

    if args.batch is not None:
        bd = BATCHES / f"batch_{args.batch}"
        args.dir = args.dir or bd / "enhanced"
        args.source = args.source or bd / "sketches.yaml"
        args.output = args.output or bd / "enhanced.yaml"

    if args.dir:
        if not (args.source and args.output):
            ap.error("--dir requires --source and --output (or use --batch)")
        collate_batch(args.dir, args.source, args.output, args.min_events)

    if args.all or args.batch is not None:
        aggregate_all()

    if not args.dir and not args.all:
        ap.error("nothing to do: pass --batch N, --dir/--source/--output, or --all")


if __name__ == "__main__":
    main()
