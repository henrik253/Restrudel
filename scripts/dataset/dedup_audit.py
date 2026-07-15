#!/usr/bin/env python3
"""Track B B5 — audit train/test pattern similarity across the repo boundary.

The repo-level split (TEST_REPOS) is only leak-safe if test-repo patterns aren't
near-duplicates of train patterns (copied basslines, shared motifs across
authors). This brute-forces Jaccard similarity of character-5-gram shingles
between every test pattern and every train pattern and reports the closest
matches + any exact (whitespace-normalized) collisions. Run after checking out
the corpus submodules.

  python scripts/dataset/dedup_audit.py            # summary + analysis/results/dedup_audit.json
  python scripts/dataset/dedup_audit.py --threshold 0.7
"""
import argparse
import hashlib
import json
import os
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
CORPUS = REPO / "corpus" / "github"
EXTS = (".js", ".mjs", ".mdx", ".md", ".txt")
PLAY_IDIOM = re.compile(r"(\$:|setcps?\(|setcpm\(|\bstack\s*\(|\bnote\s*\(|\bsound\s*\(|\.s\s*\(|\bs\s*\(\s*[\"'`])")
SKIP_PATH = re.compile(r"(node_modules|/dist/|/build/|\.test\.|/krill|/parser|packages/.*/src/)", re.I)
TEST_REPOS = {"strudel-songs-collection", "strudel_trance"}  # must match preprocess/notebook


def extract_snippets(path, text):
    ext = os.path.splitext(path)[1].lower()
    found = []
    if ext in (".mjs", ".js"):
        found += re.findall(r"=\s*`(.*?)`", text, re.S)
    if ext in (".mdx", ".md"):
        found += re.findall(r"```[a-zA-Z]*\n(.*?)```", text, re.S)
    if not found and ext in (".js", ".mjs", ".txt"):
        found.append(text)
    return [s for s in found if PLAY_IDIOM.search(s) and 15 < len(s) < 20000]


def shingles(code, k=5):
    norm = re.sub(r"\s+", " ", code).strip().lower()
    return {norm[i:i + k] for i in range(max(1, len(norm) - k + 1))}


def jaccard(a, b):
    if not a or not b:
        return 0.0
    inter = len(a & b)
    return inter / (len(a) + len(b) - inter)


def collect():
    train, test, seen = [], [], set()
    for dirpath, _, files in os.walk(CORPUS):
        if "/.git" in dirpath:
            continue
        for fn in sorted(files):
            if not fn.endswith(EXTS):
                continue
            p = os.path.join(dirpath, fn)
            rel = os.path.relpath(p, CORPUS)
            if SKIP_PATH.search("/" + rel):
                continue
            src = rel.split(os.sep)[0]
            try:
                text = open(p, encoding="utf-8", errors="ignore").read()
            except OSError:
                continue
            for snip in extract_snippets(p, text):
                h = hashlib.md5(re.sub(r"\s+", "", snip).encode()).hexdigest()
                if h in seen:
                    continue
                seen.add(h)
                rec = {"hash": h, "source": src, "path": rel,
                       "sh": shingles(snip), "norm": re.sub(r"\s+", "", snip)}
                (test if src in TEST_REPOS else train).append(rec)
    return train, test


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--threshold", type=float, default=0.8,
                    help="report cross-boundary pairs with Jaccard >= this")
    args = ap.parse_args()
    if not any(CORPUS.glob("*/*")):
        raise SystemExit(f"{CORPUS} empty — run git submodule update --init first")

    train, test = collect()
    train_norm = {r["norm"] for r in train}
    print(f"train {len(train)} | test {len(test)} (repos: {sorted(TEST_REPOS)})")

    exact = [r for r in test if r["norm"] in train_norm]
    near = []
    worst = 0.0
    for t in test:
        best, best_tr = 0.0, None
        for tr in train:
            j = jaccard(t["sh"], tr["sh"])
            if j > best:
                best, best_tr = j, tr
        worst = max(worst, best)
        if best >= args.threshold and best_tr:
            near.append({"test": t["path"], "train": best_tr["path"],
                         "jaccard": round(best, 3)})

    report = {"train": len(train), "test": len(test),
              "test_repos": sorted(TEST_REPOS),
              "exact_cross_boundary": len(exact),
              "near_dupes_ge_threshold": near,
              "threshold": args.threshold,
              "max_test_to_train_jaccard": round(worst, 3)}
    out = REPO / "analysis" / "results" / "dedup_audit.json"
    out.write_text(json.dumps(report, indent=2) + "\n")
    print(f"exact cross-boundary duplicates: {len(exact)}")
    print(f"near-dupes (Jaccard >= {args.threshold}): {len(near)}")
    print(f"max test->train Jaccard: {worst:.3f}")
    print(f"wrote {out.relative_to(REPO)}")
    if exact or near:
        print("!! leakage across the repo boundary — investigate before freezing")


if __name__ == "__main__":
    main()
