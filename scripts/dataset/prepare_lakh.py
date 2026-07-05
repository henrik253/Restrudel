#!/usr/bin/env python3
"""Prepare the Lakh MIDI Dataset (electronic subset) in YourMT3's format.

Lakh (lmd_full, ~178k MIDI files) is MIDI-ONLY — it brings real-song musical
structure that the Strudel patterns lack, but audio must be synthesized. This
script does the label half for real, and treats audio as pluggable:

  1. --download          fetch + extract lmd_full.tar.gz (~1.8 GB) once
  2. scan + FILTER       keep electronic-leaning files: drums present, most
                         pitched notes on synth/electric programs, sane length
  3. convert             MIDI -> notes/note_events .npy via YourMT3's own
                         midi2note (binary velocity, ch-9 drums) + index JSONs
  4. audio               --render builtin: placeholder WAVs with our tiny synth
                         (scripts/midi_to_wav.py, 16 kHz mono) so the pipeline
                         runs end-to-end TODAY. For real training audio, render
                         these MIDIs through actual synths (Surge XT / Vital /
                         Dexed presets) — that renderer plugs in here later.

Songs WITH audio go into lakh_{train,validation,test}_file_list.json (loader-
ready); without --render, entries go to lakh_staging_file_list.json instead so
nothing loader-visible ever points at missing audio.

Usage:
  .venv/bin/python scripts/dataset/prepare_lakh.py --download
  .venv/bin/python scripts/dataset/prepare_lakh.py --limit 200 --render builtin
"""
import argparse
import hashlib
import json
import sys
import tarfile
import urllib.request
import wave
from pathlib import Path

import numpy as np

REPO = Path(__file__).resolve().parents[2]
LMD_URL = "http://hog.ee.columbia.edu/craffel/lmd/lmd_full.tar.gz"

# Programs that read as "electronic": e-pianos, organs, e-basses + synth
# basses, synth strings, synth brass, leads, pads, FX.
SYNTH_PROGRAMS = frozenset(
    [2, 4, 5] + list(range(16, 21)) + list(range(33, 40)) + [50, 51, 62, 63]
    + list(range(80, 104)))


def download(data_home: Path):
    tar = data_home / "lmd_full.tar.gz"
    src = data_home / "lmd_full"
    if src.exists():
        print(f"{src} already present, skipping download")
        return src
    data_home.mkdir(parents=True, exist_ok=True)
    if not tar.exists():
        print(f"downloading {LMD_URL} (~1.8 GB) ...")
        urllib.request.urlretrieve(LMD_URL, tar)
    print("extracting ...")
    with tarfile.open(tar) as tf:
        tf.extractall(data_home, filter="data")
    tar.unlink()
    return src


def electronic_score(midi_path: Path, min_dur=30, max_dur=600):
    """(synth_fraction, has_drums, duration) or None if unusable."""
    import mido
    try:
        mid = mido.MidiFile(midi_path)
        dur = mid.length
    except Exception:
        return None
    if not (min_dur <= dur <= max_dur):
        return None
    program = {}  # channel -> current program
    synth = other = drums = 0
    for track in mid.tracks:
        for msg in track:
            if msg.type == "program_change":
                program[msg.channel] = msg.program
            elif msg.type == "note_on" and msg.velocity > 0:
                if msg.channel == 9:
                    drums += 1
                elif program.get(msg.channel, 0) in SYNTH_PROGRAMS:
                    synth += 1
                else:
                    other += 1
    pitched = synth + other
    if pitched < 50:
        return None
    return synth / pitched, drums > 0, dur


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-home", type=Path, default=REPO / "datasets")
    ap.add_argument("--amt-src", type=Path, default=REPO / "models" / "YourMT3" / "amt" / "src")
    ap.add_argument("--download", action="store_true")
    ap.add_argument("--min-synth-frac", type=float, default=0.5,
                    help="min fraction of pitched notes on synth/electric programs")
    ap.add_argument("--require-drums", action="store_true", default=True)
    ap.add_argument("--limit", type=int, help="max songs to convert")
    ap.add_argument("--render", choices=["none", "builtin"], default="none",
                    help="'builtin': placeholder audio via scripts/midi_to_wav.py (16 kHz)")
    args = ap.parse_args()

    src = args.data_home / "lmd_full"
    if args.download:
        src = download(args.data_home)
    if not src.exists():
        sys.exit(f"{src} not found — run with --download first")
    if not args.amt_src.exists():
        sys.exit(f"amt/src not found at {args.amt_src} — run scripts/fetch_yourmt3.py")

    sys.path.insert(0, str(args.amt_src))
    sys.path.insert(0, str(REPO / "scripts"))
    from utils.midi import midi2note
    from utils.note2event import note2note_event
    if args.render == "builtin":
        from midi_to_wav import render_midi_to_wav

    out_dir = args.data_home / "lakh_yourmt3_16k"
    index_dir = args.data_home / "yourmt3_indexes"
    index_dir.mkdir(parents=True, exist_ok=True)

    entries, scanned, kept = {}, 0, 0
    for midi_path in sorted(src.rglob("*.mid")):
        scanned += 1
        if scanned % 2000 == 0:
            print(f"  scanned {scanned}, kept {kept}")
        score = electronic_score(midi_path)
        if score is None:
            continue
        synth_frac, has_drums, dur = score
        if synth_frac < args.min_synth_frac or (args.require_drums and not has_drums):
            continue

        lakh_id = midi_path.stem  # md5 filename, unique in lmd_full
        d = out_dir / lakh_id
        try:
            notes, dur_sec = midi2note(
                str(midi_path), binary_velocity=True, ch_9_as_drum=True,
                trim_overlap=True, fix_offset=True, quantize=True, verbose=0,
                minimum_offset_sec=0.01, drum_offset_sec=0.01, ignore_pedal=True)
            note_events = note2note_event(notes)
        except Exception:
            continue  # a corrupt fraction of lmd_full is expected
        d.mkdir(parents=True, exist_ok=True)
        programs = sorted({n.program for n in notes if not n.is_drum})
        is_drum = [0] * len(programs)
        if any(n.is_drum for n in notes):
            programs, is_drum = programs + [128], is_drum + [1]
        meta = {"lakh_id": lakh_id, "program": programs, "is_drum": is_drum,
                "duration_sec": dur_sec}
        np.save(d / f"{lakh_id}_notes.npy", {**meta, "notes": notes},
                allow_pickle=True, fix_imports=False)
        np.save(d / f"{lakh_id}_note_events.npy", {**meta, "note_events": note_events},
                allow_pickle=True, fix_imports=False)

        entry = {
            "lakh_id": lakh_id,
            "n_frames": int(dur_sec * 16000),
            "mix_audio_file": str(d / "mix.wav"),
            "notes_file": str(d / f"{lakh_id}_notes.npy"),
            "note_events_file": str(d / f"{lakh_id}_note_events.npy"),
            "midi_file": str(midi_path),
            "program": programs,
            "is_drum": is_drum,
            "synth_fraction": round(synth_frac, 3),
        }
        if args.render == "builtin":
            render_midi_to_wav(midi_path, d / "mix.wav", sr=16000)
            with wave.open(str(d / "mix.wav")) as w:
                entry["n_frames"] = w.getnframes()
        entries[lakh_id] = entry
        kept += 1
        if args.limit and kept >= args.limit:
            break

    print(f"scanned {scanned} files, kept {kept} "
          f"(synth_frac >= {args.min_synth_frac}, drums required)")

    if args.render == "none":
        out = index_dir / "lakh_staging_file_list.json"
        out.write_text(json.dumps({str(i): e for i, e in enumerate(entries.values())},
                                  indent=4) + "\n")
        print(f"wrote {out} — STAGING ONLY (no audio yet; render through synths, "
              f"then rerun with --render or rewrite the index)")
    else:
        splits = {"train": {}, "validation": {}, "test": {}}
        for lakh_id, entry in entries.items():
            h = int(hashlib.md5(lakh_id.encode()).hexdigest()[8:16], 16) / 0xFFFFFFFF
            split = "train" if h < 0.9 else ("validation" if h < 0.95 else "test")
            s = splits[split]
            s[str(len(s))] = entry
        for split, file_list in splits.items():
            out = index_dir / f"lakh_{split}_file_list.json"
            out.write_text(json.dumps(file_list, indent=4) + "\n")
            print(f"wrote {out} ({len(file_list)} songs)")


if __name__ == "__main__":
    main()
