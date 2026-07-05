# scripts/dataset — fine-tuning data preparation

Builds the YourMT3+ fine-tuning corpus in the **exact format their training
code loads** (16 kHz mono WAV + `Note`/`NoteEvent` `.npy` + `yourmt3_indexes/
*_file_list.json`), and syncs it to Google Drive.

```
datasets/                          (gitignored; Drive-synced)
├── strudel_yourmt3_16k/<id>/      preprocess_strudel.py   corpus 50% + inspired
├── lakh_yourmt3_16k/<id>/         prepare_lakh.py         electronic Lakh subset
├── slakh/ maestro_yourmt3_16k/ …  install_reference_sets.py   (their hosted sets)
├── yourmt3_indexes/*.json         the file lists their loaders read
├── strudel_holdout.json           withheld corpus 50% — EVAL ONLY, never train
└── strudel_build_report.json      skip reasons, unknown sounds, alignment stats
```

## The scripts

| Script | What it does |
|---|---|
| `preprocess_strudel.py` | **Strudel → training data.** Corpus snippets (deterministic 50 % hash split; other half recorded in `strudel_holdout.json` and never rendered) + all `dataset/generated_500_inspired.yaml` songs. Per song: 16 kHz mono render (`data_gen/render_offline.mjs`), ground-truth events (`data_gen/extract_labels.mjs`, same eval + tempo code path — aligned by construction, measured ≈ +0.3 ms), YourMT3 `.npy`s, MIDI, index entries (90/5/5). |
| `prepare_lakh.py` | **Lakh MIDI (electronic subset) → labels** (+ placeholder audio). `--download` fetches lmd_full (~1.8 GB). Filter: drums present, ≥ 50 % of pitched notes on synth/electric programs, 30–600 s. Labels via their own `midi2note`. Audio is pluggable: `--render builtin` = toy synth placeholder; the real path is rendering through Surge XT / Vital / Dexed later. Without audio, entries stay in `lakh_staging_file_list.json` so loaders never see missing WAVs. |
| `install_reference_sets.py` | **Slakh / MAESTRO / EGMD** from YourMT3's own hosted, preprocessed 16 kHz archives (Zenodo/mirdata) — zero conversion. These are the **forgetting-mitigation** sets: mix them into fine-tuning batches (~20–50 %) so the model keeps piano/guitar/real-audio ability. ~30/19/22 GB. |
| `sync_drive.sh` | **datasets/ ↔ Google Drive** via rclone: `push`, `pull`, `check`. Credentials: one-time `rclone config` (browser OAuth) → `~/.config/rclone/rclone.conf`, machine-local, never in the repo. See the script header. |

## Quick start

```bash
# 0. one-time: model code + Drive login
.venv/bin/python scripts/fetch_yourmt3.py
brew install rclone && rclone config        # remote name: gdrive, type: drive

# 1. Strudel data (≈900 training songs: ~420 corpus + 500 inspired)
.venv/bin/python scripts/dataset/preprocess_strudel.py

# 2. electronic Lakh labels (audio rendering comes later)
.venv/bin/python scripts/dataset/prepare_lakh.py --download --limit 5000

# 3. reference sets for forgetting mitigation (big downloads)
.venv/bin/python scripts/dataset/install_reference_sets.py --sets egmd,maestro,slakh

# 4. store in Drive
scripts/dataset/sync_drive.sh push
```

Smoke-test flags: `--limit 5`, `--sources inspired`, `--index-only` (rebuild
JSONs without re-rendering).

## Design decisions (the fine-tuning gotchas, encoded)

- **16 kHz mono** everywhere — the model frontend's native format.
- **Programs land in the checkpoint's vocab buckets** (`MT3_FULL_PLUS`):
  synth voices → Synth Lead 80/81; any voice with median pitch < C3 → Synth
  Bass 38 (Electric Bass bucket); `note(...)` without `.s()` → Strudel's
  default triangle → 80.
- **Clap has no class in their GM drum vocab** (`GM_DRUM_NOTES`) — that's why
  the stock model misses 909 claps. `cp` maps to 40 (Electric Snare): trains
  as snare-class but stays distinct from `sd`=38 in the MIDI. Recovering a
  true clap class means extending the drum vocab (bigger change, later).
- **Binary velocity** (their synthetic-data convention).
- **Deterministic hash splits** — corpus train-pool/holdout and
  train/validation/test never shift between runs; the holdout half of the
  corpus is the untouched eval set.
- **Validity gate**: songs must evaluate through the real Strudel engine
  (queryArc) and render non-silent audio, or they're skipped and logged in
  `strudel_build_report.json`. On the corpus expect ~75–80 % yield — the rest
  are doc fragments / partial snippets.
- **Alignment probe**: per song, first audible transient vs first label onset
  is measured and reported (warns if the median exceeds 30 ms).

## What this does NOT do yet

- **Per-voice stems** for YourMT3's cross-stem mixing augmentation (highest-
  leverage next step: render each `$:`/`stack` voice separately).
- **Real synth rendering for Lakh** (Surge XT / Vital / Dexed presets).
- **Registering the datasets in their training config** — add a `"strudel"`
  preset to `amt/src/config/data_presets.py` pointing at these file lists
  when the fine-tuning run is set up.

## Colab notebook

For the Drive-first workflow (download reference sets into Drive, format docs,
dataset analysis, split-integrity checks): [notebooks/04_finetune_data.ipynb](../../notebooks/04_finetune_data.ipynb).
