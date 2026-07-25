# Deploying Restrudel (roadmap A6)

```
your.domain.com ──HTTPS (Caddy, auto-TLS)──┐
                                            ├─ /            → app/frontend/dist  (static)
                                            ├─ /ws /api /healthz → Node backend :8787 (systemd)
                                            └─ backend ──HTTPS──▶ RunPod Serverless (GPU)
```

Nothing GPU-related runs on this server — the model lives on RunPod; the
server runs only the backend and Caddy, both as systemd services (start on
boot, restart on crash, logs in journald).

## First deploy

1. Get the code onto the server (rsync or git clone), e.g. `/home/<user>/restrudel`.
2. Point your domain's **A record** at the server's IP.
3. Run the setup:

```bash
sudo DOMAIN=your.domain.com ./deploy/setup_server.sh
```

On the first run it creates `app/backend/.env` as a template and stops — fill
in `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID`, `ANTHROPIC_API_KEY`, then run it
again. It installs Node 20, ffmpeg, Caddy, the Python venv (`mido`), all npm
deps, builds the frontend, installs + starts both services, and health-checks
the result.

## Updating

```bash
# from your machine: sync the code, then re-run the script on the server
rsync -avz --delete --exclude '.git' --exclude 'node_modules' --exclude '.venv' \
  --exclude 'models' --exclude 'datasets' --exclude 'dataset' --exclude 'runs' \
  --exclude '*.wav' --exclude '*.mp3' --exclude '.claude' \
  ./ user@server:/home/user/restrudel/
ssh user@server 'cd restrudel && sudo DOMAIN=your.domain.com ./deploy/setup_server.sh'
```

(`--delete` mirrors code but leaves the excluded, server-installed dirs —
`node_modules`, `.venv` — untouched.)

## Operations

| what | how |
|---|---|
| backend logs (live) | `journalctl -u restrudel-backend -f` |
| restart after .env change | `sudo systemctl restart restrudel-backend` |
| service status | `systemctl status restrudel-backend caddy` |
| health check | `curl -s localhost:8787/healthz` |
| Caddy/TLS logs | `journalctl -u caddy -f` |

## Files

- `setup_server.sh` — the idempotent one-shot installer (re-run after updates).
- `restrudel-backend.service` — systemd unit template (`__APP_DIR__`,
  `__RUN_USER__` substituted at install).
- `Caddyfile` — vhost template (`__DOMAIN__`, `__APP_DIR__` substituted):
  static SPA with `index.html` fallback, `/ws` + `/api/*` + `/healthz`
  proxied to the backend, automatic HTTPS.
