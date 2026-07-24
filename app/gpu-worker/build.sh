#!/usr/bin/env bash
# Build + push the Restrudel GPU worker image.
#
#   app/gpu-worker/build.sh <dockerhub-user> [tag]      # build and push
#   PUSH=0 app/gpu-worker/build.sh <dockerhub-user>     # build locally only
#
# Always builds linux/amd64: RunPod hosts are x86_64, and an arm64 image built
# on an Apple Silicon Mac will not start there.
set -euo pipefail

USER_NS="${1:?usage: build.sh <dockerhub-user> [tag]}"
TAG="${2:-v1}"
IMAGE="${USER_NS}/restrudel-gpu-worker:${TAG}"

cd "$(dirname "$0")/../.."   # repo root — the build context
REPO_ROOT="$PWD"

# The image vendors YourMT3's amt/src, which lives in the gitignored models/
# checkout. Fetch it if absent (same script the notebooks use).
if [[ ! -f models/YourMT3/amt/src/config/config.py ]]; then
  echo "==> models/YourMT3 missing; fetching YourMT3 source"
  PY="${PYTHON_BIN:-$REPO_ROOT/.venv/bin/python}"
  [[ -x "$PY" ]] || PY=python3
  "$PY" scripts/fetch_yourmt3.py
fi

echo "==> building $IMAGE (linux/amd64)"
BUILD_ARGS=(buildx build --platform linux/amd64 -f app/gpu-worker/Dockerfile -t "$IMAGE")
if [[ "${PUSH:-1}" == "1" ]]; then
  BUILD_ARGS+=(--push)
else
  BUILD_ARGS+=(--load)
fi
docker "${BUILD_ARGS[@]}" .

echo
echo "==> done: $IMAGE"
echo "    Use this exact image name in the RunPod endpoint form."
