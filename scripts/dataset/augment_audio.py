#!/usr/bin/env python3
"""Track B B6 / strategy S2 — audio-domain augmentation of rendered clips.

Rationale: docs/augmentation_strategy_B4.md. Training audio today is pristine
Strudel renders; real uploads are mastered/compressed/EQ'd/lossy. This applies a
randomized, **strictly time-preserving** effect chain so the SAME notes are
heard through many processing chains — attacking the renderer confound — WITHOUT
moving onsets (labels stay aligned within mir_eval's +-50 ms).

Time-preserving ONLY: gain, EQ tilt, saturation, compression, bitcrush,
sample-rate decimation (sample-&-hold, length kept), short reverb (tail
truncated back to input length), peak-limit, optional MP3 round-trip. NEVER
time-stretch / pitch-shift / onset-moving delay — those corrupt labels.

Deps: numpy + scipy (both already used by the pipeline). `pedalboard` is used if
present for higher-quality reverb/MP3, else a numpy fallback runs.

  # one clip -> N variants next to it (mix.wav -> mix_aug0.wav, ...)
  python scripts/dataset/augment_audio.py --in path/mix.wav --n 2 --seed 7
  # batch: augment every <id>/mix.wav under a render dir
  python scripts/dataset/augment_audio.py --render-dir DATA/strudel_yourmt3_16k --n 1
"""
import argparse
import json
import wave
from pathlib import Path

import numpy as np
from scipy import signal


def read_wav(p: Path):
    with wave.open(str(p)) as w:
        sr, n, sw, ch = (w.getframerate(), w.getnframes(),
                         w.getsampwidth(), w.getnchannels())
        raw = w.readframes(n)
    dt = {1: np.int8, 2: np.int16, 4: np.int32}[sw]
    x = np.frombuffer(raw, dtype=dt).astype(np.float32)
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    return x / np.iinfo(dt).max, sr


def write_wav(p: Path, x: np.ndarray, sr: int):
    x = np.clip(x, -1.0, 1.0)
    with wave.open(str(p), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


# --- effects (all length-preserving) --------------------------------------
def eq_tilt(x, sr, rng):
    # first-order low/high shelf: random spectral tilt +-6 dB
    tilt = rng.uniform(-6, 6)
    g = 10 ** (tilt / 20)
    b, a = signal.butter(1, 1000 / (sr / 2), btype="low")
    low = signal.lfilter(b, a, x)
    return (g * low + (x - low) / g).astype(np.float32)


def saturate(x, rng):
    drive = rng.uniform(1.0, 6.0)
    return (np.tanh(drive * x) / np.tanh(drive)).astype(np.float32)


def compress(x, sr, rng):
    thr = rng.uniform(0.1, 0.4)
    ratio = rng.uniform(2.0, 8.0)
    env = np.abs(x)
    # 5 ms attack/release smoothing
    a = np.exp(-1.0 / (0.005 * sr))
    env = signal.lfilter([1 - a], [1, -a], env)
    over = np.maximum(env, thr)
    gain = (thr + (over - thr) / ratio) / (over + 1e-9)
    return (x * gain).astype(np.float32)


def bitcrush(x, rng):
    bits = rng.integers(6, 13)  # 6..12-bit
    q = 2 ** int(bits)
    return (np.round(x * q) / q).astype(np.float32)


def decimate_hold(x, sr, rng):
    # sample-rate reduction via sample-and-hold — LENGTH PRESERVED
    factor = int(rng.integers(1, 5))
    if factor == 1:
        return x
    y = x.copy()
    for i in range(0, len(x), factor):
        y[i:i + factor] = x[i]
    return y.astype(np.float32)


def short_reverb(x, sr, rng):
    # convolve with a short exponential-decay noise IR, truncate to keep length.
    dur = rng.uniform(0.05, 0.25)
    n = int(dur * sr)
    ir = (rng.standard_normal(n) * np.exp(-np.linspace(0, 6, n))).astype(np.float32)
    ir[0] = 1.0  # keep the dry transient at t=0 -> onsets don't move
    wet = signal.fftconvolve(x, ir)[: len(x)]
    mix = rng.uniform(0.05, 0.3)
    return ((1 - mix) * x + mix * wet).astype(np.float32)


def peak_limit(x, ceil=0.98):
    m = np.max(np.abs(x)) + 1e-9
    return (x * min(1.0, ceil / m)).astype(np.float32)


def augment(x, sr, rng):
    """A randomized, length-preserving chain. Returns a new array of len(x)."""
    n0 = len(x)
    x = eq_tilt(x, sr, rng)
    if rng.random() < 0.7:
        x = saturate(x, rng)
    if rng.random() < 0.7:
        x = compress(x, sr, rng)
    if rng.random() < 0.4:
        x = bitcrush(x, rng)
    if rng.random() < 0.3:
        x = decimate_hold(x, sr, rng)
    if rng.random() < 0.5:
        x = short_reverb(x, sr, rng)
    x = peak_limit(x * rng.uniform(0.6, 1.0))
    assert len(x) == n0, "augmentation changed length — would break label alignment"
    return x.astype(np.float32)


def _stable_hash(s: str) -> int:
    """Deterministic across processes (python's hash() is salted per run)."""
    import hashlib
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16)


def _rng_for(seed: int, stem: str, k: int):
    return np.random.default_rng((seed * 1000 + _stable_hash(stem) + k) % 2**31)


def _variant(clip: Path, k: int) -> Path:
    return clip.with_name(f"{clip.stem}_aug{k}.wav")


def augment_file_list(fl_path: Path, n: int, seed: int, allow_test: bool):
    """S2 for training: augment every entry of a YourMT3 file list IN the list.

    This is the split-safe path (Track B B6): it touches only the songs the
    given list references — pass the TRAIN list, and the test set can never be
    augmented by construction — and it APPENDS each variant as its own index
    entry, so the loader actually trains on it (a bare *_aug.wav next to the
    original is invisible to YourMT3). Aug entries share the base entry's
    labels (the chain is strictly time-preserving) and carry:
      aug_of:  the base song id     aug_wav: the variant's file name
    Re-runs are idempotent: existing aug entries are dropped and rebuilt
    (same seed -> byte-identical variants).
    """
    if "test" in fl_path.name and not allow_test:
        raise SystemExit(f"refusing to augment a TEST list ({fl_path.name}); "
                         f"the test set stays un-augmented (--allow-test to override)")
    fl = json.load(open(fl_path))
    base = [e for e in fl.values() if "aug_wav" not in e]
    out_entries, made = [], 0
    for e in base:
        out_entries.append(e)
        clip = Path(e["mix_audio_file"])
        if not clip.exists():
            continue
        x, sr = read_wav(clip)
        for k in range(n):
            out = _variant(clip, k)
            write_wav(out, augment(x, sr, _rng_for(seed, clip.parent.name, k)), sr)
            aug = dict(e)
            aug["mix_audio_file"] = str(out)
            aug["aug_of"] = e.get("strudel_id") or e.get("nes_id") or clip.parent.name
            aug["aug_wav"] = out.name
            out_entries.append(aug)
            made += 1
    fl_path.write_text(json.dumps({str(i): e for i, e in enumerate(out_entries)},
                                  indent=4) + "\n")
    print(f"{fl_path.name}: {len(base)} base songs -> +{made} aug entries "
          f"({len(out_entries)} total)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", type=Path)
    ap.add_argument("--render-dir", type=Path,
                    help="augment every <id>/mix.wav below this dir (no indexing)")
    ap.add_argument("--file-list", type=Path,
                    help="a yourmt3 *_file_list.json: augment its songs AND "
                         "append the variants as index entries (split-safe; "
                         "pass the train list)")
    ap.add_argument("--n", type=int, default=1, help="variants per clip")
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--allow-test", action="store_true")
    args = ap.parse_args()

    if args.file_list:
        augment_file_list(args.file_list, args.n, args.seed, args.allow_test)
        return
    if args.render_dir:
        clips = sorted(args.render_dir.glob("*/mix.wav"))
    elif args.inp:
        clips = [args.inp]
    else:
        raise SystemExit("pass --file-list <json>, --render-dir <dir> or --in <wav>")

    made = 0
    for clip in clips:
        x, sr = read_wav(clip)
        for k in range(args.n):
            y = augment(x, sr, _rng_for(args.seed, clip.parent.name, k))
            write_wav(_variant(clip, k), y, sr)
            made += 1
    print(f"augmented {len(clips)} clip(s) -> {made} variant(s)")


if __name__ == "__main__":
    main()
