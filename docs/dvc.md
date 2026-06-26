# Storing the dataset in Google Drive with DVC

Restrudel keeps **code and small symbolic artifacts in git**, and the
**GB-scale WAV audio in Google Drive**, versioned with
[DVC](https://dvc.org). DVC replaces the earlier rclone-based plan: it ties the
exact dataset state to a git commit, so checking out a commit + `dvc pull` gives
you the matching audio.

Only tiny `*.dvc` pointer files are committed to git; the WAVs themselves live in
Drive.

## One-time setup

### 0. Install

```bash
pip install "dvc[gdrive]"
```

`dvc init` has already been run in this repo (`.dvc/` is committed).

### 1. Create the Drive folder

Make a folder in Google Drive (e.g. `Restrudel/`). Open it and copy the id from
the URL:

```
https://drive.google.com/drive/folders/<THIS_IS_THE_FOLDER_ID>
```

### 2. Create an OAuth client (one time, in Google Cloud Console)

DVC's native gdrive remote no longer ships a usable default OAuth client, so you
must supply your own. This is a free, ~5-minute step:

1. <https://console.cloud.google.com> → create (or pick) a project.
2. **APIs & Services → Library →** enable **Google Drive API**.
3. **APIs & Services → OAuth consent screen →** type **External**; add your own
   Google account under **Test users** (no app verification needed for personal
   use).
4. **APIs & Services → Credentials → Create credentials → OAuth client ID →**
   application type **Desktop app**. Copy the **client id** and **client secret**.

### 3. Wire up the remote

Run the helper script with your three values. It writes the folder id to the
committed `.dvc/config` and the secret credentials to the gitignored
`.dvc/config.local`:

```bash
GDRIVE_FOLDER_ID=<folder_id> \
GDRIVE_CLIENT_ID=<oauth_client_id> \
GDRIVE_CLIENT_SECRET=<oauth_client_secret> \
  scripts/setup_dvc_remote.sh
```

Then commit the shared config:

```bash
git add .dvc/config && git commit -m "Configure DVC gdrive remote"
```

### 4. First push (authorize)

The first `dvc push`/`pull` opens a browser to authorize your Google account.
The resulting token is cached at `.dvc/tmp/gdrive-user-credentials.json`, which
is **gitignored** — do not commit or share it.

## Daily workflow

```bash
# track new renders
dvc add dataset/audio
git add dataset/audio.dvc dataset/.gitignore
git commit -m "Track audio renders with DVC"
dvc push                 # upload to Drive

# fetch on another machine
git pull
dvc pull                 # download matching audio from Drive
```

## Using it in Colab / headless

There is no browser to authorize in Colab, so reuse the token you already
created locally. Pass its contents via the `GDRIVE_CREDENTIALS_DATA` env var:

```python
import os
os.environ["GDRIVE_CREDENTIALS_DATA"] = open(
    ".dvc/tmp/gdrive-user-credentials.json"
).read()                       # or paste the JSON from a Colab secret
# then: !dvc pull
```

Store that JSON as a **Colab secret**, not in the notebook — it grants access to
your Drive.

## What is committed vs. ignored

| Committed to git            | Never committed (gitignored)                         |
| --------------------------- | ---------------------------------------------------- |
| `.dvc/config`               | `.dvc/config.local` (OAuth client id/secret)         |
| `.dvcignore`                | `.dvc/tmp/` (OAuth token cache)                       |
| `dataset/*.dvc` pointers    | `.dvc/cache/` (local content-addressed cache)        |
| `dataset/{code,midi,events}`, `manifest.jsonl` | `dataset/audio/` (the WAVs — in Drive) |

## Gotchas

- **Token cache is a secret.** `.dvc/tmp/gdrive-user-credentials.json` grants
  access to your Drive. It is gitignored; keep it that way.
- **Rate limits.** Drive throttles many small files. Renders are batched per
  `dataset/audio` directory, so DVC pushes them as a single tracked unit.
- **Shared access.** With personal OAuth, only the authorizing account (the
  folder owner) can push/pull. For multi-user/CI access later, switch to a
  service-account JSON (`dvc remote modify --local storage gdrive_use_service_account true`).
