#!/usr/bin/env bash
#
# Sync datasets/ <-> Google Drive with rclone.
#
# One-time setup (this is where your credentials go):
#   1. brew install rclone
#   2. rclone config
#        n) new remote
#        name>   gdrive
#        type>   drive          (Google Drive)
#        client_id / client_secret>   leave BLANK (rclone's built-in app)
#        scope>  drive          (full access, so pull works for folders you made)
#        -> a browser opens; log into your Google account and approve.
#   Credentials land in ~/.config/rclone/rclone.conf — machine-local,
#   NEVER in this repo. Verify with: rclone lsd gdrive:
#
# Usage:
#   scripts/dataset/sync_drive.sh push          # datasets/ -> Drive (additive copy)
#   scripts/dataset/sync_drive.sh pull          # Drive -> datasets/
#   scripts/dataset/sync_drive.sh check         # dry-run diff, changes nothing
#   REMOTE=g2 DEST=other/dir scripts/dataset/sync_drive.sh push
#
# Notes:
#   - `push` uses `rclone copy` (never deletes on Drive). Use `push --mirror`
#     to make Drive exactly match local (deletes remote-only files).
#   - lmd_full/ (178k tiny source MIDIs) and archives are excluded: regenerable
#     via prepare_lakh.py --download, and Drive handles huge file counts badly.
set -euo pipefail

REMOTE="${REMOTE:-gdrive}"
DEST="${DEST:-restrudel/datasets}"
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
LOCAL="$REPO/datasets"

FLAGS=(--progress --transfers 8 --exclude "lmd_full/**" --exclude "*.tar.gz")

command -v rclone >/dev/null || { echo "rclone not installed: brew install rclone"; exit 1; }
rclone listremotes | grep -q "^${REMOTE}:" || {
  echo "rclone remote '${REMOTE}:' not configured — run: rclone config  (see header of this script)"; exit 1; }

case "${1:-}" in
  push)
    if [[ "${2:-}" == "--mirror" ]]; then
      rclone sync "$LOCAL" "$REMOTE:$DEST" "${FLAGS[@]}"
    else
      rclone copy "$LOCAL" "$REMOTE:$DEST" "${FLAGS[@]}"
    fi
    ;;
  pull)
    rclone copy "$REMOTE:$DEST" "$LOCAL" "${FLAGS[@]}"
    ;;
  check)
    rclone check "$LOCAL" "$REMOTE:$DEST" "${FLAGS[@]}" --one-way || true
    ;;
  *)
    echo "usage: $0 {push [--mirror]|pull|check}"; exit 1
    ;;
esac
