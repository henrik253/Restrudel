#!/usr/bin/env bash
# One-shot Ubuntu server setup for the Restrudel app (roadmap A6).
#
#   sudo DOMAIN=your.domain.com ./deploy/setup_server.sh
#
# Optional overrides:
#   RUN_USER=<user>   the account that owns and runs the app   (default: the sudo caller)
#   APP_DIR=<path>    where the repo lives                     (default: /home/$RUN_USER/restrudel)
#
# Idempotent: safe to re-run after a code update (it re-installs deps, rebuilds
# the frontend, and restarts the services). The app itself is expected to be at
# APP_DIR already (rsync or git clone) — this script does not fetch code.
#
# What it sets up, and why a systemd service instead of a boot script:
# systemd restarts the backend on crash, orders it after the network, journals
# its logs (journalctl -u restrudel-backend), and starts it on boot — a
# boot-time script does only the last of those.
set -euo pipefail

DOMAIN="${DOMAIN:?usage: sudo DOMAIN=your.domain.com $0}"
RUN_USER="${RUN_USER:-${SUDO_USER:?run with sudo}}"
APP_DIR="${APP_DIR:-/home/$RUN_USER/restrudel}"
NODE_MAJOR=20

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }

[[ $EUID -eq 0 ]] || { echo "run with sudo"; exit 1; }
[[ -f "$APP_DIR/app/backend/src/server.mjs" ]] || {
  echo "no app found at $APP_DIR — rsync/clone the repo there first"; exit 1;
}

# ---------------------------------------------------------------- packages ---
say "system packages (ffmpeg, python, build tools)"
apt-get update -q
apt-get install -y -q curl git ffmpeg python3-venv python3-pip debian-keyring \
  debian-archive-keyring apt-transport-https ca-certificates

if ! command -v node >/dev/null || [[ "$(node -v | cut -c2-3)" -lt $NODE_MAJOR ]]; then
  say "Node.js $NODE_MAJOR (NodeSource)"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y -q nodejs
fi

if ! command -v caddy >/dev/null; then
  say "Caddy (official apt repo)"
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -q && apt-get install -y -q caddy
fi

# ------------------------------------------------------------- app installs ---
say "app dependencies (as $RUN_USER)"
sudo -u "$RUN_USER" bash -euo pipefail <<APP
cd "$APP_DIR"

# Submodule (no-op when the tree came via rsync with the files already present)
if [[ -d .git ]] && [[ ! -f vendor/MIDI-To-Strudel/Midi-to-Strudel.py ]]; then
  git submodule update --init vendor/MIDI-To-Strudel
fi

( cd app/backend  && npm ci --omit=dev )
( cd data_gen     && npm ci )                       # Strudel engine for validation
( cd app/frontend && npm ci && npm run build )      # static files for Caddy

# Python for MIDI-To-Strudel (its only dep is mido). The backend finds this
# via PYTHON_BIN, or the default APP_DIR/.venv/bin/python.
if [[ ! -x .venv/bin/python ]]; then python3 -m venv .venv; fi
.venv/bin/pip install -q --upgrade pip mido
APP

# --------------------------------------------------------------------- .env ---
ENV_FILE="$APP_DIR/app/backend/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  say "creating $ENV_FILE template — FILL IN THE KEYS, then re-run"
  sudo -u "$RUN_USER" tee "$ENV_FILE" >/dev/null <<'ENV'
# Restrudel backend — secrets live here, never in git.
TRANSCRIBER=runpod
RUNPOD_API_KEY=
RUNPOD_ENDPOINT_ID=
RUNPOD_MODEL_VERSION=v2mix_s42-20260722
ANTHROPIC_API_KEY=
CODEGEN=m2s+polish
ENV
  chmod 600 "$ENV_FILE"
  exit 1
fi
chmod 600 "$ENV_FILE"

# ------------------------------------------------------------------ systemd ---
say "systemd service: restrudel-backend"
sed -e "s|__APP_DIR__|$APP_DIR|g" -e "s|__RUN_USER__|$RUN_USER|g" \
  "$APP_DIR/deploy/restrudel-backend.service" \
  > /etc/systemd/system/restrudel-backend.service
systemctl daemon-reload
systemctl enable --now restrudel-backend
systemctl restart restrudel-backend

# -------------------------------------------------------------------- caddy ---
say "Caddy vhost for $DOMAIN"
mkdir -p /etc/caddy
sed -e "s|__DOMAIN__|$DOMAIN|g" -e "s|__APP_DIR__|$APP_DIR|g" \
  "$APP_DIR/deploy/Caddyfile" > /etc/caddy/Caddyfile
# The caddy user must be able to read the built frontend under /home/<user>/
usermod -aG "$RUN_USER" caddy 2>/dev/null || true
chmod g+x "/home/$RUN_USER"
systemctl enable caddy
systemctl reload caddy 2>/dev/null || systemctl restart caddy

# ------------------------------------------------------------------- verify ---
say "verifying"
sleep 1
if curl -fsS http://127.0.0.1:8787/healthz | grep -q '"ok":true'; then
  echo "backend: OK (http://127.0.0.1:8787/healthz)"
else
  echo "backend: NOT healthy — check: journalctl -u restrudel-backend -n 50"; exit 1
fi
systemctl is-active --quiet caddy && echo "caddy: OK" || { echo "caddy: NOT running"; exit 1; }

say "done — https://$DOMAIN (DNS A record must point here; Caddy fetches the cert on first hit)"
echo "logs:   journalctl -u restrudel-backend -f"
echo "update: rsync the repo, then re-run this script"
