"""YourMT3+ inference: WAV -> note events + tempo. No RunPod dependency.

Lifted from the path proven in `notebooks/06_benchmark.ipynb` and
`scripts/yourmt3_transcribe.py`, with one deliberate change: we read the model's
`Note` objects directly instead of writing a MIDI file and parsing it back. The
notes already carry `program` / `is_drum`, which a MIDI round-trip would blur —
and the backend's codegen wants exactly those fields.

Importable and runnable without a GPU (CPU inference is slow but correct), so
the whole path is testable before a cent of GPU time is spent.
"""
from __future__ import annotations

import os
import sys
import time
from pathlib import Path
from typing import Any

from model_registry import ModelSpec, resolve

# Where the YourMT3 source tree lives inside the image (see Dockerfile). Locally
# this points at the repo's models/YourMT3 checkout.
MODEL_ROOT = Path(os.environ.get("YOURMT3_ROOT", "/opt/yourmt3")).resolve()

# The checkpoint is trained with ignore_velocity, so predicted velocity is a
# binary onset flag rather than a dynamic — see transcribe_to_notes.
DEFAULT_VELOCITY = 96

_MODEL_CACHE: dict[str, Any] = {}


def _prepare_sys_path() -> None:
    for p in (MODEL_ROOT / "amt" / "src", MODEL_ROOT):
        if str(p) not in sys.path:
            sys.path.insert(0, str(p))


def _stage_checkpoint(spec: ModelSpec) -> Path:
    """Expose the checkpoint where YourMT3 expects it.

    `initialize_trainer` resolves checkpoints as
    `amt/logs/<project>/<exp_id>/checkpoints/last.ckpt` relative to the model
    root. The real file lives on the network volume, so we symlink rather than
    copy — 759 MB per container start would dominate cold start.
    """
    staged = MODEL_ROOT / "amt" / "logs" / spec.project / spec.exp_id / "checkpoints" / "last.ckpt"
    staged.parent.mkdir(parents=True, exist_ok=True)
    if staged.is_symlink() or staged.exists():
        if staged.resolve() == spec.ckpt_path.resolve():
            return staged
        staged.unlink()
    staged.symlink_to(spec.ckpt_path)
    return staged


def _torch_device() -> str:
    import torch

    return "cuda" if torch.cuda.is_available() else "cpu"


def load_model(model_version: str | None = None, checkpoint_root: Path | None = None):
    """Load (and cache) a checkpoint. Cached per version so one warm container
    can serve several model versions without reloading."""
    spec = resolve(model_version, checkpoint_root)
    if spec.version in _MODEL_CACHE:
        return _MODEL_CACHE[spec.version], spec

    _prepare_sys_path()
    _stage_checkpoint(spec)

    import torch

    device = _torch_device()
    # bf16 is a GPU concept; on CPU (local smoke tests) force fp32 instead of
    # failing inside Lightning's precision plugin.
    spec_for_load = spec if device == "cuda" else ModelSpec(
        version=spec.version, ckpt_path=spec.ckpt_path, exp_id=spec.exp_id,
        project=spec.project, arch=spec.arch, precision="32",
    )

    # initialize_trainer resolves logs/ relative to the process cwd.
    os.chdir(MODEL_ROOT)
    from model_helper import load_model_checkpoint  # noqa: E402  (needs sys.path)

    t0 = time.perf_counter()
    model = load_model_checkpoint(args=spec_for_load.load_args(), device=device)
    if device == "cuda":
        model = model.to(torch.device("cuda"))
    print(f"[inference] loaded {spec.version} on {device} in {time.perf_counter() - t0:.1f}s",
          flush=True)

    _MODEL_CACHE[spec.version] = model
    return model, spec


def transcribe_to_notes(model, wav_path: Path) -> tuple[list[dict], dict]:
    """Run the model over a WAV; return (contract-shaped note dicts, decode errors).

    Mirrors `model_helper.transcribe`'s slicing/decode/merge steps, then maps
    model programs through the checkpoint's inverse vocabulary so `program` is a
    General MIDI number the backend can reason about.
    """
    import torch
    import torchaudio
    from collections import Counter

    from utils.audio import slice_padded_array
    from utils.note2event import mix_notes
    from utils.event2note import merge_zipped_note_events_and_ties_to_notes

    device = torch.device(_torch_device())

    audio, sr = torchaudio.load(uri=str(wav_path))
    audio = torch.mean(audio, dim=0).unsqueeze(0)  # -> mono
    audio = torchaudio.functional.resample(audio, sr, model.audio_cfg["sample_rate"])
    segments = slice_padded_array(audio, model.audio_cfg["input_frames"],
                                  model.audio_cfg["input_frames"])
    segments = torch.from_numpy(segments.astype("float32")).to(device).unsqueeze(1)

    pred_token_arr, _ = model.inference_file(bsz=8, audio_segments=segments)

    n_items = segments.shape[0]
    start_secs = [model.audio_cfg["input_frames"] * i / model.audio_cfg["sample_rate"]
                  for i in range(n_items)]
    notes_per_channel = []
    err_cnt = Counter()
    for ch in range(model.task_manager.num_decoding_channels):
        arr_ch = [arr[:, ch, :] for arr in pred_token_arr]
        zipped, _, _ = model.task_manager.detokenize_list_batches(
            arr_ch, start_secs, return_events=True)
        notes_ch, err_ch = merge_zipped_note_events_and_ties_to_notes(zipped)
        notes_per_channel.append(notes_ch)
        err_cnt += err_ch
    notes = mix_notes(notes_per_channel)

    inverse_vocab = getattr(model, "midi_output_inverse_vocab", None) or {}
    out = []
    for n in notes:
        program = n.program
        if not n.is_drum and inverse_vocab:
            program = inverse_vocab.get(n.program, [n.program])[0]
        out.append({
            "onset_s": round(float(n.onset), 4),
            "offset_s": round(float(max(n.offset, n.onset + 0.01)), 4),
            "pitch": int(n.pitch),
            # This model is trained with ignore_velocity: it emits 1 for an
            # onset, not a dynamic. Passing that through would read as
            # near-silent downstream, so substitute a neutral mezzo-forte.
            "velocity": int(n.velocity) if int(n.velocity) > 1 else DEFAULT_VELOCITY,
            "program": int(program),
            "is_drum": bool(n.is_drum),
        })
    out.sort(key=lambda e: (e["onset_s"], e["pitch"]))
    return out, dict(err_cnt)


def estimate_tempo(wav_path: Path) -> dict:
    """Tempo / beat grid for the snippet.

    Audio analysis lives on this side of the wire by design — the Node backend
    never needs DSP. Downbeats assume 4/4 (every 4th beat): librosa has no
    downbeat tracker, and 4/4 is what the downstream Strudel codegen supports
    anyway (MIDI-To-Strudel is 4/4-only).
    """
    import librosa

    y, sr = librosa.load(str(wav_path), sr=None, mono=True)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
    beats = [round(float(b), 4) for b in beats]
    tempo_bpm = float(tempo.item() if hasattr(tempo, "item") else tempo)
    return {
        "tempo_bpm": round(tempo_bpm, 2) if tempo_bpm > 0 else None,
        "beats_s": beats,
        "downbeats_s": beats[::4],
        "meter_assumed": "4/4",
    }


def transcribe(wav_path: Path, model_version: str | None = None,
               checkpoint_root: Path | None = None) -> dict:
    """Full worker payload for one WAV — the shape the backend consumes."""
    t_load = time.perf_counter()
    model, spec = load_model(model_version, checkpoint_root)
    load_s = time.perf_counter() - t_load

    t_infer = time.perf_counter()
    events, decode_errors = transcribe_to_notes(model, wav_path)
    infer_s = time.perf_counter() - t_infer

    t_tempo = time.perf_counter()
    tempo = estimate_tempo(wav_path)
    tempo_s = time.perf_counter() - t_tempo

    return {
        "events": events,
        "tempo_bpm": tempo["tempo_bpm"],
        "beats_s": tempo["beats_s"],
        "downbeats_s": tempo["downbeats_s"],
        "meter_assumed": tempo["meter_assumed"],
        "model_version": spec.version,
        "decode_errors": decode_errors,
        "timings": {
            "model_load_s": round(load_s, 3),
            "infer_s": round(infer_s, 3),
            "tempo_s": round(tempo_s, 3),
            "device": _torch_device(),
        },
    }
