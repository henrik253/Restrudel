# Restrudel transcription worker for RunPod Serverless.
#
# Build (from the repo root — the build context needs models/YourMT3):
#   docker buildx build --platform linux/amd64 \
#     -f app/gpu-worker/Dockerfile -t <user>/restrudel-gpu-worker:v1 --push .
#
# --platform linux/amd64 is REQUIRED on Apple Silicon: RunPod hosts are x86_64
# and an arm64 image will not start there.
#
# The checkpoint is NOT baked in — it comes from the RunPod network volume at
# /runpod-volume/checkpoints/<model_version>/, so new models ship without a
# rebuild. Keep the image slim: its size is paid on every cold start.
FROM pytorch/pytorch:2.4.0-cuda12.1-cudnn9-runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    YOURMT3_ROOT=/opt/yourmt3 \
    CHECKPOINT_ROOT=/runpod-volume/checkpoints \
    HF_HOME=/tmp/hf \
    WANDB_MODE=disabled

# libsndfile: soundfile/librosa. ffmpeg is deliberately absent — the backend
# hands us a ready 16 kHz mono WAV.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY app/gpu-worker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# YourMT3 model code (Apache-2.0, vendored checkout under models/YourMT3).
# Only the source tree — logs/ and model_output/ are build noise.
COPY models/YourMT3/amt/src /opt/yourmt3/amt/src
COPY models/YourMT3/model_helper.py /opt/yourmt3/model_helper.py

COPY app/gpu-worker/*.py /app/

# Fail the build rather than a cold start if an import regressed.
RUN python -c "import runpod, librosa, torch, pytorch_lightning, transformers; \
import model_registry, handler; print('worker imports OK')"

CMD ["python", "-u", "handler.py"]
