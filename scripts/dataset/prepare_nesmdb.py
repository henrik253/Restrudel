#!/usr/bin/env python3
"""Prepare NES-MDB (chiptune) in YourMT3's format — real electronic timbre.

NES-MDB (Donahue et al., MIT) is 5,278 NES-soundtrack pieces with per-voice note
labels (2 pulse + triangle + noise channels) AND a headless renderer, so it
yields (audio, aligned note labels) with genuine 2A03 *synthesized* timbre — an
independent-renderer complement to Strudel that needs no VST hosting (Track B
B3, docs/external_electronic_data_B3.md).

Mirrors prepare_lakh.py: MIDI -> YourMT3 notes/note_events .npy + index; audio
rendered here (real NES audio via the `nesmdb` package) rather than a placeholder.

>>> COLAB-run (needs `pip install nesmdb` + its VGM tooling). Verify the render
call against the installed package version before scaling — flagged below. <<<

Usage (Colab):
  pip install nesmdb
  python scripts/dataset/prepare_nesmdb.py --download --data-home $DATA_HOME \
      --amt-src $AMT_SRC --limit 200
"""
import argparse
import json
import sys
import tarfile
import urllib.request
import wave
from pathlib import Path

import numpy as np

# NES-MDB MIDI release (public). The `nesmdb` package also fetches this; we pull
# the MIDI tarball directly so the label path matches prepare_lakh exactly.
NESMDB_MIDI_URL = "https://github.com/chrisdonahue/nesmdb/releases/download/v0.1.0/nesmdb_midi.tar.gz"


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
    print("extracting ...")
    with tarfile.open(tar) as tf:
        tf.extractall(data_home, filter="data")
    return src


def render_audio(midi_path: Path, out_wav: Path) -> bool:
    """Render one NES-MDB MIDI to 16 kHz mono WAV with the real 2A03 voice.

    TODO(Colab): call the installed `nesmdb` renderer. The documented flow is
    MIDI -> score -> VGM -> WAV (44.1 kHz) via nesmdb.vgm/score, then downsample
    to 16 kHz mono. Left as the one call to verify against the package version
    (its module layout has changed across releases). Fall back to a generic
    synth only if the real renderer is unavailable (defeats the timbre purpose).
    """
    raise NotImplementedError(
        "wire nesmdb MIDI->WAV render on Colab — see docstring + "
        "docs/external_electronic_data_B3.md")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--download", action="store_true")
    ap.add_argument("--data-home", type=Path, required=True)
    ap.add_argument("--amt-src", type=Path, required=True,
                    help="YourMT3 amt/src (for utils.midi/note2event)")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--no-render", action="store_true",
                    help="labels + staging index only (no audio yet)")
    args = ap.parse_args()

    src = download(args.data_home) if args.download else args.data_home / "nesmdb_midi"
    if not src.exists():
        sys.exit(f"{src} not found — run with --download first")
    if not args.amt_src.exists():
        sys.exit(f"amt/src not found at {args.amt_src} — run scripts/fetch_yourmt3.py")

    sys.path.insert(0, str(args.amt_src))
    from utils.midi import midi2note
    from utils.note2event import note2note_event

    out_dir = args.data_home / "nesmdb_yourmt3_16k"
    index_dir = args.data_home / "yourmt3_indexes"
    index_dir.mkdir(parents=True, exist_ok=True)

    entries, kept = {}, 0
    for midi_path in sorted(src.rglob("*.mid")):
        nes_id = midi_path.stem
        d = out_dir / nes_id
        try:
            notes, dur = midi2note(str(midi_path), binary_velocity=True,
                                   ch_9_as_drum=False, trim_overlap=True,
                                   fix_offset=True, quantize=True, verbose=0)
            note_events = note2note_event(notes)
        except Exception:
            continue
        d.mkdir(parents=True, exist_ok=True)
        programs = sorted({n.program for n in notes if not n.is_drum})
        meta = {"nes_id": nes_id, "program": programs, "duration_sec": dur}
        np.save(d / f"{nes_id}_notes.npy", {**meta, "notes": notes},
                allow_pickle=True, fix_imports=False)
        np.save(d / f"{nes_id}_note_events.npy", {**meta, "note_events": note_events},
                allow_pickle=True, fix_imports=False)
        entry = {"nes_id": nes_id, "n_frames": int(dur * 16000),
                 "mix_audio_file": str(d / "mix.wav"),
                 "notes_file": str(d / f"{nes_id}_notes.npy"),
                 "note_events_file": str(d / f"{nes_id}_note_events.npy"),
                 "midi_file": str(midi_path), "program": programs}
        if not args.no_render:
            render_audio(midi_path, d / "mix.wav")
            with wave.open(str(d / "mix.wav")) as w:
                entry["n_frames"] = w.getnframes()
        entries[nes_id] = entry
        kept += 1
        if args.limit and kept >= args.limit:
            break

    # split 90/5/5 by id hash (mirrors prepare_lakh) or staging if no audio.
    import hashlib
    if args.no_render:
        (index_dir / "nesmdb_staging_file_list.json").write_text(
            json.dumps({str(i): e for i, e in enumerate(entries.values())}, indent=4))
        print(f"kept {kept} (labels only) -> nesmdb_staging_file_list.json")
        return
    splits = {"train": {}, "validation": {}, "test": {}}
    for nes_id, e in entries.items():
        h = int(hashlib.md5(nes_id.encode()).hexdigest()[8:16], 16) / 0xFFFFFFFF
        split = "train" if h < 0.9 else ("validation" if h < 0.95 else "test")
        s = splits[split]; s[str(len(s))] = e
    for split, fl in splits.items():
        (index_dir / f"nesmdb_{split}_file_list.json").write_text(json.dumps(fl, indent=4))
        print(f"wrote nesmdb_{split}_file_list.json ({len(fl)})")


if __name__ == "__main__":
    main()
