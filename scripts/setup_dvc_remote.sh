#!/usr/bin/env bash
#
# Configure the DVC -> Google Drive remote for Restrudel.
#
# DVC stores the heavy WAV dataset in Google Drive; git keeps only the small
# `.dvc` pointer files. This replaces the earlier rclone-based plan.
#
# You need three values (see docs/dvc.md for how to obtain them):
#   GDRIVE_FOLDER_ID     - the Drive folder id from its URL
#                          (https://drive.google.com/drive/folders/<THIS>)
#   GDRIVE_CLIENT_ID     - OAuth 2.0 client id  (Desktop-app type, GCP console)
#   GDRIVE_CLIENT_SECRET - OAuth 2.0 client secret
#
# The folder id is shared configuration -> .dvc/config (committed to git).
# The OAuth client id/secret are machine-local -> .dvc/config.local (gitignored),
# so credentials are never committed.
#
# Usage:
#   GDRIVE_FOLDER_ID=...  GDRIVE_CLIENT_ID=...  GDRIVE_CLIENT_SECRET=... \
#       scripts/setup_dvc_remote.sh
#
set -euo pipefail

REMOTE="${REMOTE_NAME:-storage}"

: "${GDRIVE_FOLDER_ID:?set GDRIVE_FOLDER_ID (the id in the Drive folder URL)}"
: "${GDRIVE_CLIENT_ID:?set GDRIVE_CLIENT_ID (OAuth desktop client id)}"
: "${GDRIVE_CLIENT_SECRET:?set GDRIVE_CLIENT_SECRET (OAuth desktop client secret)}"

if ! command -v dvc >/dev/null 2>&1; then
  echo "error: dvc not found. Install with: pip install 'dvc[gdrive]'" >&2
  exit 1
fi

# (Re)create the default remote. -f overwrites an existing definition.
dvc remote add -d -f "$REMOTE" "gdrive://${GDRIVE_FOLDER_ID}"

# OAuth app credentials -> local-only config so they are never committed.
dvc remote modify --local "$REMOTE" gdrive_client_id     "$GDRIVE_CLIENT_ID"
dvc remote modify --local "$REMOTE" gdrive_client_secret "$GDRIVE_CLIENT_SECRET"

echo
echo "Configured DVC remote '$REMOTE' -> gdrive://${GDRIVE_FOLDER_ID}"
echo
echo "Committed config (.dvc/config):"
cat .dvc/config
echo
echo "Next steps:"
echo "  1. git add .dvc/config && git commit -m 'Configure DVC gdrive remote'"
echo "  2. dvc push   # first push opens a browser to authorize your Google account"
