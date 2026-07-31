"""Genre router (roadmap A10): which checkpoint should transcribe this snippet?

A 516-parameter classification head over the FROZEN base YourMT3+ encoder,
trained in notebooks/07_genre_classifier.ipynb on the fine-tuning splits.
Head weights + metadata live in classifier/ next to this file — 4 KB, baked
into the image, no volume round-trip.

Two things are deliberately asymmetric here:

- The decision is NOT argmax. Routing sums the probability mass of the
  base-model classes (classic + acoustic_band) and picks the base checkpoint
  only when it exceeds tau (0.30, swept on validation). Sending electronic
  audio to the base model costs ~0.3 F1; the reverse mistake costs ~0.1.
- Classification always runs on the BASE model's encoder — the head was
  trained on base features, so even a route to the fine-tuned model derives
  its decision from the base encoder.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

CLASSIFIER_DIR = Path(__file__).resolve().parent / "classifier"
META_PATH = CLASSIFIER_DIR / "classifier_meta.json"
HEAD_PATH = CLASSIFIER_DIR / "head_best.pt"

_CACHE: dict = {}


def load_meta() -> dict:
    if "meta" not in _CACHE:
        _CACHE["meta"] = json.loads(META_PATH.read_text())
    return _CACHE["meta"]


def decide(probs: dict[str, float], meta: dict | None = None) -> tuple[str, float]:
    """The tau rule on class probabilities -> ('base' | 'finetuned', p_base)."""
    meta = meta or load_meta()
    p_base = sum(p for c, p in probs.items() if meta["class_to_model"].get(c) == "base")
    route = "base" if p_base > float(meta["tau_route_to_base"]) else "finetuned"
    return route, p_base


def _load_head(device):
    """head_best.pt -> eval-mode module. The layer width comes from the state
    dict (the notebook used LazyLinear), the class count from the metadata."""
    import torch

    key = f"head:{device}"
    if key in _CACHE:
        return _CACHE[key]

    meta = load_meta()
    state = torch.load(HEAD_PATH, map_location="cpu")
    n_classes, dim = state["net.1.weight"].shape
    if n_classes != len(meta["classes"]):
        raise ValueError(f"head has {n_classes} classes, metadata lists {len(meta['classes'])}")

    class Head(torch.nn.Module):
        """Mirror of the notebook's GenreHead — same module path ('net.1'),
        same layer_norm-before-linear forward, so the state dict loads 1:1."""

        def __init__(self):
            super().__init__()
            self.net = torch.nn.Sequential(torch.nn.Dropout(0.1),
                                           torch.nn.Linear(dim, n_classes))

        def forward(self, feats):
            feats = torch.nn.functional.layer_norm(feats.float(), feats.shape[-1:])
            return self.net(feats)

    head = Head()
    head.load_state_dict(state)
    head.eval().to(device)
    _CACHE[key] = head
    return head


def _crops(audio, crop_samples: int, n: int):
    """(T,) mono waveform -> (k, crop_samples) evenly spaced crops, k <= n.
    Deterministic (mirrors the notebook's val/test crops); a snippet shorter
    than one crop becomes a single zero-padded crop."""
    import torch

    total = audio.shape[-1]
    if total <= crop_samples:
        return torch.nn.functional.pad(audio, (0, crop_samples - total)).unsqueeze(0)
    offsets = sorted({int((total - crop_samples) * i / max(1, n - 1)) for i in range(n)})
    return torch.stack([audio[o:o + crop_samples] for o in offsets])


def encode_pooled(model, wavs):
    """(B, crop_samples) waveforms -> (B, D) pooled encoder latents.

    Must stay numerically identical to nb07's encode_pooled — the head was
    trained on exactly this pooling: each ~2 s native segment goes through
    spectrogram -> pre_encoder -> encoder, then everything but the batch and
    feature dims is mean-pooled, then the segments are mean-pooled."""
    import torch

    B, T = wavs.shape
    seg_len = model.audio_cfg["input_frames"]
    n_seg = math.ceil(T / seg_len)
    padded = torch.nn.functional.pad(wavs, (0, n_seg * seg_len - T))
    segs = padded.view(B * n_seg, 1, seg_len)
    x = model.spectrogram(segs)
    x = model.pre_encoder(x)
    enc = model.encoder(inputs_embeds=x)["last_hidden_state"]
    enc = enc.flatten(1, -2).mean(dim=1)
    return enc.view(B, n_seg, -1).mean(dim=1)


def classify(model, wav_path: Path, n_crops: int = 3) -> dict:
    """Route one snippet using the base model's encoder.

    Takes up to n_crops evenly spaced 5 s crops, averages their class
    probabilities (one decision per snippet, unlike the notebook's per-crop
    eval votes) and applies the tau rule.
    """
    import torch
    import torchaudio

    meta = load_meta()
    sr = int(meta["crop"]["sample_rate"])
    crop_samples = int(meta["crop"]["seconds"] * sr)

    audio, in_sr = torchaudio.load(uri=str(wav_path))
    audio = torch.mean(audio, dim=0, keepdim=True)  # -> mono
    audio = torchaudio.functional.resample(audio, in_sr, sr)[0]

    param = next(model.parameters())
    wavs = _crops(audio, crop_samples, n_crops).to(device=param.device, dtype=param.dtype)

    head = _load_head(param.device)
    with torch.no_grad():
        probs = head(encode_pooled(model, wavs)).softmax(-1).mean(dim=0)

    classes = meta["classes"]
    probs_by_class = {c: round(float(p), 4) for c, p in zip(classes, probs.cpu())}
    route, p_base = decide(probs_by_class, meta)
    return {
        "predicted_class": classes[int(probs.argmax())],
        "probs": probs_by_class,
        "p_base": round(p_base, 4),
        "tau": float(meta["tau_route_to_base"]),
        "route": route,
        "crops": int(wavs.shape[0]),
    }
