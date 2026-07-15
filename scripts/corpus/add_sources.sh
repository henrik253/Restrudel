#!/usr/bin/env bash
# Track B B2 — add a corpus source as a shallow submodule under corpus/github/.
#
# The analysis (notebooks/01_corpus_analysis.ipynb) and
# scripts/dataset/preprocess_strudel.py auto-discover any directory under
# corpus/github/ by name, so adding a submodule is all that's needed — no code
# change. Sources and their license/blocker status are tracked in
# corpus/sources.yaml; adopt a candidate by moving it to `ingested` there, then
# running this script.
#
# Usage:
#   scripts/corpus/add_sources.sh <name> <git-url>
# Example:
#   scripts/corpus/add_sources.sh hannahlovegood-algorave-band \
#       https://github.com/hannahlovegood/algorave-band.git
#
# Only add sources with a clear license (see corpus/sources.yaml). Do NOT add
# unlicensed repos.
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <name> <git-url>" >&2
  exit 1
fi
NAME="$1"
URL="$2"
REPO_ROOT="$(git rev-parse --show-toplevel)"
DEST="corpus/github/${NAME}"

cd "$REPO_ROOT"
if [ -e "$DEST" ]; then
  echo "already exists: $DEST" >&2
  exit 1
fi

echo "adding shallow submodule: $NAME <- $URL"
git submodule add --depth 1 "$URL" "$DEST"
echo "done. Next: re-run notebooks/01_corpus_analysis.ipynb to refresh"
echo "analysis/results/* so the new source enters the distributions (B5)."
