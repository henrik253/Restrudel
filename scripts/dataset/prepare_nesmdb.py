#!/usr/bin/env python3
"""Prepare NES-MDB (chiptune) in YourMT3's format — real electronic timbre.

NES-MDB (Donahue et al., MIT) is 5,278 NES-soundtrack pieces with per-voice note
labels (2 pulse + triangle + noise channels), yielding (audio, aligned note
labels) with genuine 2A03 *synthesized* timbre — an independent-renderer
complement to Strudel that needs no VST hosting (Track B B3,
docs/external_electronic_data_B3.md).

Facts verified against the real MIDI release (2026-07-16, 12 MB tarball,
sha256-checked against the README):
  - the tarball ships the OFFICIAL train/valid/test split as directories
    (4502/403/373, game-level) — we keep it verbatim, never re-split;
  - every file has exactly 4 named tracks: p1/p2 (pulse, programs 80/81 =
    Synth Lead bucket), tr (triangle, program 38 = **Synth Bass** — the class
    Slakh silently dropped), no (noise, ALREADY on MIDI channel 9);
  - noise notes use pitches 1-16 (the 2A03's noise periods), NOT GM drum
    pitches — we remap them into GM drum classes the training vocab knows
    (long/low period -> kick 36, mid -> snare 38, short/high -> closed hat 42).

Audio: the `nesmdb` Python package is Python-2-only, so we do NOT use it.
Render path is the Raw VGM release + `vgm2wav` (C tool, builds on Colab):
match VGMs by file stem, render 44.1 kHz, downsample to 16 kHz mono. Gated
behind --vgm-dir; --no-render (default in notebook 04) lands labels + a
staging index whose entries already carry their canonical split.

Usage (Colab or local):
  python scripts/dataset/prepare_nesmdb.py --download --data-home $DATA_HOME \
      --amt-src $AMT_SRC --no-render          # labels + staging index
  python scripts/dataset/prepare_nesmdb.py --data-home $DATA_HOME \
      --amt-src $AMT_SRC --vgm-dir $VGMS      # + real 2A03 audio -> split lists
"""
import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import tarfile
import urllib.request
import wave
from pathlib import Path

import numpy as np

# NES-MDB MIDI release. The GitHub-releases URL previously used here 404s —
# the dataset is distributed via Google Drive (see the repo README, which also
# publishes this sha256).
NESMDB_MIDI_GDRIVE_ID = "1w2uo1Cmio4gz6nGUhZOtzF54kPkoKyo7"
NESMDB_MIDI_URL = (
    "https://drive.google.com/uc?export=download&id=" + NESMDB_MIDI_GDRIVE_ID)
NESMDB_MIDI_SHA256 = "37610e2ca5fe70359c85170cf1f4982596783bb304c59d9c439f68c24ff4ee93"

# Official split directories inside the tarball -> our split names.
SPLIT_DIRS = {"train": "train", "valid": "validation", "test": "test"}


def noise_to_gm_drum(pitch: int) -> int:
    """2A03 noise period (MIDI pitch 1-16 in the release) -> GM drum class.

    Composers used long periods (low rumble) as kicks/toms, mid as snares,
    short (hissy ticks) as hats — mirrored here so every drum lands in a class
    of the training drum vocab (config.vocabulary.GM_DRUM_NOTES).
    """
    if pitch <= 4:
        return 36  # Bass Drum
    if pitch <= 10:
        return 38  # Snare Drum
    return 42      # Closed Hi-Hat


def download(data_home: Path) -> Path:
    src = data_home / "nesmdb_midi"
    if src.exists():
        print(f"{src} already present, skipping download")
        return src
    data_home.mkdir(parents=True, exist_ok=True)
    tar = data_home / "nesmdb_midi.tar.gz"
    if not tar.exists():
        print(f"downloading {NESMDB_MIDI_URL} ...")
        urllib.request.urlretrieve(NESMDB_MIDI_URL, tar)
    digest = hashlib.sha256(tar.read_bytes()).hexdigest()
    if digest != NESMDB_MIDI_SHA256:
        tar.unlink()
        sys.exit(f"nesmdb_midi.tar.gz sha256 mismatch ({digest[:12]}…) — Google "
                 f"Drive may have served an interstitial page; download manually "
                 f"from the NES-MDB README and place it at {tar}")
    print("sha256 verified; extracting ...")
    with tarfile.open(tar) as tf:
        tf.extractall(data_home, filter="data")
    return src


def render_audio(
    vgm_dir: Path, stem: str, out_wav: Path, vgm2wav: str,
    duration_sec: float | None = None,
) -> bool:
    """Render one song's Raw-VGM to 16 kHz mono WAV via vgm2wav + downsample.

    NES-MDB's MIDI and VGM are both derived from the same assembly at 44.1 kHz
    resolution, so they are alignment-compatible (spike 2026-07-17: first-onset
    deltas 0 to -30 ms over 12 songs). BUT many VGMs loop and vgm2wav renders
    the loop passes, while the MIDI labels cover one pass only (+20-49 s of
    unlabeled audio observed) — so the render is truncated to `duration_sec`,
    the label duration.
    """
    vgm = next(iter(vgm_dir.rglob(f"{stem}.vgm")), None)
    if vgm is None:
        return False
    tmp44 = out_wav.with_suffix(".44k.wav")
    r = subprocess.run([vgm2wav, str(vgm), str(tmp44)],
                       capture_output=True, text=True)
    if r.returncode != 0 or not tmp44.exists():
        return False
    from scipy.io import wavfile  # vgm2wav writes WAVE_FORMAT_EXTENSIBLE;
    from scipy.signal import resample_poly  # stdlib `wave` rejects it
    sr, x = wavfile.read(tmp44)
    if x.dtype == np.int16:
        x = x.astype(np.float32) / 32768.0
    elif x.dtype == np.int32:
        x = x.astype(np.float32) / 2**31
    else:
        x = x.astype(np.float32)
    if x.ndim > 1:
        x = x.mean(axis=1)
    y = resample_poly(x, 16000, sr)
    if duration_sec is not None:
        y = y[: int(duration_sec * 16000)]
    with wave.open(str(out_wav), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(16000)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    tmp44.unlink()
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--download", action="store_true")
    ap.add_argument("--data-home", type=Path, required=True)
    ap.add_argument("--amt-src", type=Path, required=True,
                    help="YourMT3 amt/src (for utils.midi/note2event)")
    ap.add_argument("--limit", type=int, default=0, help="max songs per split")
    ap.add_argument("--no-render", action="store_true",
                    help="labels + staging index only (no audio yet)")
    ap.add_argument("--vgm-dir", type=Path,
                    help="extracted NES-MDB Raw VGM release (for rendering)")
    ap.add_argument("--vgm2wav", default="vgm2wav",
                    help="path to the vgm2wav binary (vgmtools)")
    args = ap.parse_args()

    src = download(args.data_home) if args.download else args.data_home / "nesmdb_midi"
    if not src.exists():
        sys.exit(f"{src} not found — run with --download first")
    if not args.amt_src.exists():
        sys.exit(f"amt/src not found at {args.amt_src} — run scripts/fetch_yourmt3.py")
    if not args.no_render:
        if not args.vgm_dir or not args.vgm_dir.exists():
            sys.exit("--vgm-dir required for rendering (NES-MDB Raw VGM release); "
                     "or pass --no-render for labels only")
        if shutil.which(args.vgm2wav) is None:
            sys.exit(f"{args.vgm2wav} not found — build vgm2wav (vgmtools) first, "
                     f"or pass --no-render")

    sys.path.insert(0, str(args.amt_src))
    from utils.midi import midi2note
    from utils.note2event import note2note_event

    out_dir = args.data_home / "nesmdb_yourmt3_16k"
    index_dir = args.data_home / "yourmt3_indexes"
    index_dir.mkdir(parents=True, exist_ok=True)

    # Official split from the tarball's directory layout — never re-split.
    missing_dirs = [d for d in SPLIT_DIRS if not (src / d).exists()]
    if missing_dirs:
        sys.exit(f"expected official split dirs {sorted(SPLIT_DIRS)} under {src}; "
                 f"missing {missing_dirs} — is this the v1 MIDI release?")

    entries, kept, skipped, no_vgm = {}, 0, 0, 0
    for split_dir, split in SPLIT_DIRS.items():
        n_split = 0
        for midi_path in sorted((src / split_dir).glob("*.mid")):
            nes_id = midi_path.stem
            d = out_dir / nes_id
            try:
                # Noise voice is already on channel 9 in the release ->
                # ch_9_as_drum=True makes it drums (program 128).
                notes, dur = midi2note(str(midi_path), binary_velocity=True,
                                       ch_9_as_drum=True, trim_overlap=True,
                                       fix_offset=True, quantize=True, verbose=0)
            except Exception:
                skipped += 1
                continue
            # Remap 2A03 noise periods (pitch 1-16) into GM drum classes.
            for n in notes:
                if n.is_drum:
                    n.pitch = noise_to_gm_drum(n.pitch)
            if not notes:
                skipped += 1
                continue
            note_events = note2note_event(notes)
            d.mkdir(parents=True, exist_ok=True)
            programs = sorted({n.program for n in notes if not n.is_drum})
            has_drum = any(n.is_drum for n in notes)
            program_list = programs + ([128] if has_drum else [])
            is_drum_list = [0] * len(programs) + ([1] if has_drum else [])
            meta = {"nes_id": nes_id, "program": program_list,
                    "is_drum": is_drum_list, "duration_sec": dur}
            np.save(d / f"{nes_id}_notes.npy", {**meta, "notes": notes},
                    allow_pickle=True, fix_imports=False)
            np.save(d / f"{nes_id}_note_events.npy",
                    {**meta, "note_events": note_events},
                    allow_pickle=True, fix_imports=False)
            entry = {"nes_id": nes_id, "split": split,
                     "n_frames": int(dur * 16000),
                     "mix_audio_file": str(d / "mix.wav"),
                     "notes_file": str(d / f"{nes_id}_notes.npy"),
                     "note_events_file": str(d / f"{nes_id}_note_events.npy"),
                     "midi_file": str(midi_path),
                     "program": program_list, "is_drum": is_drum_list}
            if not args.no_render:
                if not render_audio(args.vgm_dir, nes_id, d / "mix.wav",
                                    args.vgm2wav, duration_sec=dur):
                    no_vgm += 1
                    continue
                with wave.open(str(d / "mix.wav")) as w:
                    entry["n_frames"] = w.getnframes()
            entries[nes_id] = entry
            kept += 1
            n_split += 1
            if args.limit and n_split >= args.limit:
                break

    if skipped:
        print(f"skipped {skipped} files (midi2note failure or empty)")
    if no_vgm:
        print(f"skipped {no_vgm} files (no matching VGM / render failure)")

    if args.no_render:
        # Staging only: no playable audio yet. Entries carry their canonical
        # split, so the render step just promotes them into split lists.
        (index_dir / "nesmdb_staging_file_list.json").write_text(
            json.dumps({str(i): e for i, e in enumerate(entries.values())},
                       indent=4) + "\n")
        print(f"kept {kept} (labels only) -> nesmdb_staging_file_list.json "
              f"(official split preserved per-entry)")
        return

    splits = {"train": {}, "validation": {}, "test": {}}
    for e in entries.values():
        s = splits[e["split"]]
        s[str(len(s))] = e
    for split, fl in splits.items():
        (index_dir / f"nesmdb_{split}_file_list.json").write_text(
            json.dumps(fl, indent=4) + "\n")
        print(f"wrote nesmdb_{split}_file_list.json ({len(fl)}) [official split]")


if __name__ == "__main__":
    main()
