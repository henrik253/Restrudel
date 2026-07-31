# GPU worker (roadmap A1a)

Transcription worker for **RunPod Serverless**: a 16 kHz mono WAV snippet in,
note events + tempo out. Runs the fine-tuned YourMT3+ checkpoint
(**v2mix_s42** today) on a scale-to-zero GPU.

```
backend  ──{audio_b64, model_version}──▶  handler.py
                                            ├─ inference.py   model load + decode → notes
                                            ├─ genre_classifier.py  "auto": base vs fine-tuned (A10)
                                            └─ model_registry.py  which checkpoint, which arch
         ◀──{events, tempo_bpm, beats_s, downbeats_s, classifier?, timings}──┘
```

## Contract

**In** (RunPod `input`):

```json
{"audio_b64": "<base64 16 kHz mono WAV>", "model_version": "v2mix_s42-20260722"}
```

`model_version` is optional and falls back to the `MODEL_VERSION` env var.

The special value `"auto"` engages the genre router: a 516-parameter head over
the frozen **base** encoder (trained in `notebooks/07_genre_classifier.ipynb`,
weights in `classifier/`) scores up to three 5 s crops and routes to the base
checkpoint only when P(classic) + P(acoustic_band) exceeds τ = 0.30 — not
argmax, because misrouting electronic audio to the base model costs ~0.3 F1
while the reverse costs ~0.1. Auto requests may name the two targets:

```json
{"audio_b64": "...", "model_version": "auto",
 "model_versions": {"finetuned": "v2mix_s42-20260722", "base": "base-2024"}}
```

(omitted names fall back to `MODEL_VERSION` / `MODEL_VERSION_BASE`). The output
then carries the decision — or the reason it fell back to the fine-tuned model
(e.g. the base checkpoint is not on the volume yet); a broken router never
fails the job:

```json
"classifier": {"predicted_class": "electronic",
               "probs": {"electronic": 0.91, "classic": 0.03,
                         "acoustic_band": 0.02, "electronic_drums": 0.04},
               "p_base": 0.05, "tau": 0.3, "route": "finetuned",
               "crops": 3, "classify_s": 0.4}
```

**Out**:

```json
{"events": [{"onset_s": 0.49, "offset_s": 1.0, "pitch": 36,
             "velocity": 96, "program": 2, "is_drum": false}],
 "tempo_bpm": 117.19, "beats_s": [...], "downbeats_s": [...],
 "meter_assumed": "4/4", "model_version": "...", "decode_errors": {},
 "timings": {"model_load_s": 0.0, "infer_s": 6.1, "tempo_s": 8.3, "device": "cuda"}}
```

Errors come back as `{"error": "...", "error_type": "input"|"worker"}` rather
than exceptions, so the backend can tell a bad request from a broken worker.

Two things worth knowing about the events:

- **`velocity` is always 96.** The checkpoint is trained with `ignore_velocity`
  and emits a binary onset flag, not a dynamic. Passing the raw `1` through
  would read as near-silent downstream, so a neutral value is substituted.
- **`program`** is a General MIDI number (mapped through the checkpoint's
  inverse vocabulary); drums carry `is_drum: true` with `program` 128.
- **Downbeats assume 4/4** (every 4th beat). librosa has no downbeat tracker,
  and 4/4 is what the Strudel codegen supports anyway.

## Swapping the model (no code change)

A model version is just a directory on the network volume:

```
/runpod-volume/checkpoints/
  v2mix_s42-20260722/
    last.ckpt      required
    model.json     optional — overrides exp_id / project / arch / precision
```

Deploying a new checkpoint = upload a directory + point `MODEL_VERSION` (or the
per-request field) at it. `model.json` exists so that even a model with a
*different architecture* needs no code change:

```json
{"exp_id": "ft_v3_20260901", "project": "ymt3",
 "arch": ["-tk", "mc13_full_plus_256", "..."], "precision": "bf16-mixed"}
```

Omitted fields fall back to the mc13_256 defaults in `model_registry.py`. The
checkpoint is symlinked (not copied) into the `amt/logs/<project>/<exp_id>/`
layout YourMT3 expects — copying 759 MB per container start would dominate the
cold start.

**The base checkpoint** (`base-2024/`, the router's classical/acoustic target)
is the released YourMT3+ — same architecture, but its exp_id and project differ
from our fine-tunes, so its `model.json` is required:

```json
{"exp_id": "mc13_256_g4_all_v7_mt3f_sqr_rms_moe_wf4_n8k2_silu_rope_rp_b36_nops",
 "project": "2024"}
```

Until that directory exists on the volume, `auto` requests log the miss and
fall back to the fine-tuned model (reported in the `classifier` block).

## Local test — no GPU, no RunPod account

The whole path runs on CPU (slower, identical output):

```bash
CHECKPOINT_ROOT=/path/to/checkpoints YOURMT3_ROOT=/path/to/models/YourMT3 \
MODEL_VERSION=v2mix_s42-20260722 \
  python handler.py --audio snippet16k.wav -o result.json
```

Unit tests that need neither checkpoint nor GPU (input validation, model
resolution, tempo):

```bash
python test_worker.py
```

Verified 2026-07-24 on CPU against the released base checkpoint: 8 s snippet →
45 events, model load 8.3 s, inference 6.3 s, tempo 117 BPM.

## Build & deploy

```bash
app/gpu-worker/build.sh <dockerhub-user> v1
```

Builds `linux/amd64` (required — RunPod hosts are x86_64; an arm64 image from
an Apple Silicon Mac will not start) and pushes. The script fetches
`models/YourMT3` first if that gitignored checkout is missing.

Then, in the RunPod console:

1. **Storage → Network Volumes** — create one (5 GB is plenty); note the datacenter.
2. Upload the checkpoint into `checkpoints/v2mix_s42-20260722/` on that volume
   (temp pod + `rclone` from Drive; on a pod the volume mounts at `/workspace`,
   on serverless at `/runpod-volume`).
3. **Serverless → New Endpoint → Docker image** — your pushed image, attach the
   volume, min workers 0 / max 1, FlashBoot on, execution timeout ≥ 120 s.
4. Put the endpoint ID and API key in the backend env (`RUNPOD_ENDPOINT_ID`,
   `RUNPOD_API_KEY`).

Cold start is dominated by image pull + model load; `PRELOAD_MODEL=1` (default)
loads the checkpoint at container start so warm requests skip it.

## Environment variables

| var | default | meaning |
|---|---|---|
| `MODEL_VERSION` | `v2mix_s42-20260722` | default checkpoint directory |
| `MODEL_VERSION_BASE` | `base-2024` | base checkpoint (genre-router target) |
| `CHECKPOINT_ROOT` | `/runpod-volume/checkpoints` | where model directories live |
| `YOURMT3_ROOT` | `/opt/yourmt3` | YourMT3 source tree |
| `PRELOAD_MODEL` | `1` | load the model at container start |
| `MAX_AUDIO_BYTES` | `8388608` | reject oversized payloads before the GPU |
