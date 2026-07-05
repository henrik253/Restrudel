#!/usr/bin/env python3
"""Build the Strudel training dataset in YourMT3's native format.

Sources
  corpus    50% of the pattern snippets extracted from corpus/github/* (the
            other 50% is WITHHELD for evaluation — its ids are recorded in
            strudel_holdout.json and never rendered here). The split is a
            deterministic hash of the code, so it never changes between runs.
  inspired  all songs from dataset/generated_500_inspired.yaml (the improved
            recompositions — NOT the raw sampled sketches).

Per song (under <data-home>/strudel_yourmt3_16k/<id>/):
  song.js           the Strudel source
  labels.json       ground-truth events from data_gen/extract_labels.mjs
  mix.wav           16 kHz mono render (data_gen/render_offline.mjs)
  *_notes.npy       YourMT3 Note list      (utils.note_event_dataclasses.Note)
  *_note_events.npy YourMT3 NoteEvent list (via utils.note2event)
  *.mid             the labels as MIDI (their note_event2midi; listenable)

plus <data-home>/yourmt3_indexes/strudel_{train,validation,test}_file_list.json
(90/5/5, hash-split) in the exact shape their loaders expect.

Fine-tuning gotchas handled here:
  - audio is 16 kHz MONO (the model frontend's format);
  - programs land in the checkpoint's vocab buckets (MT3_FULL_PLUS): synth
    voices -> Synth Lead 80/81, low voices -> Electric/Synth Bass 38;
  - clap has NO class in their GM drum vocab -> cp maps to 40 (Electric
    Snare: same "Snare Drum" bucket as sd=38, but distinguishable in MIDI);
  - binary velocity (their convention for synthetic data);
  - onset alignment audio<->labels is measured per song and reported;
  - every song passes queryArc (extraction fails -> song skipped + logged).

Usage:
  .venv/bin/python scripts/dataset/preprocess_strudel.py                # everything
  .venv/bin/python scripts/dataset/preprocess_strudel.py --limit 5     # smoke test
  .venv/bin/python scripts/dataset/preprocess_strudel.py --index-only  # rebuild JSONs
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

REPO = Path(__file__).resolve().parents[2]
NODE_TIMEOUT = 180  # seconds per song; corpus snippets can be pathological

# ---------------------------------------------------------------- amt/src ---
def import_amt(amt_src: Path):
    """Put YourMT3's amt/src on sys.path and import what we need."""
    sys.path.insert(0, str(amt_src))
    from utils.note_event_dataclasses import Note  # noqa: F401
    from utils.note2event import note2note_event, validate_notes, trim_overlapping_notes
    from utils.midi import note_event2midi
    return Note, note2note_event, validate_notes, trim_overlapping_notes, note_event2midi


# ------------------------------------------------------- corpus collection ---
# Extraction mirrors notebooks/01_corpus_analysis.ipynb (the 855-snippet set).
EXTS = (".js", ".mjs", ".mdx", ".md", ".txt")
PLAY_IDIOM = re.compile(r"(\$:|setcps?\(|setcpm\(|\bstack\s*\(|\bnote\s*\(|\bsound\s*\(|\.s\s*\(|\bs\s*\(\s*[\"'`])")
SKIP_PATH = re.compile(r"(node_modules|/dist/|/build/|\.test\.|/krill|/parser|packages/.*/src/)", re.I)


def snippet_hash(code: str) -> str:
    return hashlib.md5(re.sub(r"\s+", "", code).encode()).hexdigest()


def extract_snippets(path: str, text: str):
    ext = os.path.splitext(path)[1].lower()
    found = []
    if ext in (".mjs", ".js"):
        found += re.findall(r"=\s*`(.*?)`", text, re.S)
    if ext in (".mdx", ".md"):
        found += re.findall(r"```[a-zA-Z]*\n(.*?)```", text, re.S)
    if not found and ext in (".js", ".mjs", ".txt"):
        found.append(text)
    return [s for s in found if PLAY_IDIOM.search(s) and 15 < len(s) < 20000]


def collect_corpus(corpus_dir: Path, keep_fraction: float):
    """Deterministic split: md5(code) decides train-pool vs holdout, forever."""
    kept, holdout, seen = [], [], set()
    for dirpath, _, files in os.walk(corpus_dir):
        if "/.git" in dirpath:
            continue
        for fn in sorted(files):
            if not fn.endswith(EXTS):
                continue
            p = os.path.join(dirpath, fn)
            rel = os.path.relpath(p, corpus_dir)
            if SKIP_PATH.search("/" + rel):
                continue
            try:
                text = open(p, encoding="utf-8", errors="ignore").read()
            except OSError:
                continue
            for snip in extract_snippets(p, text):
                h = snippet_hash(snip)
                if h in seen:
                    continue
                seen.add(h)
                entry = {"id": f"corpus_{h[:10]}", "hash": h, "path": rel, "code": snip}
                # hash -> [0,1): stable independent of file order
                if int(h[:8], 16) / 0xFFFFFFFF < keep_fraction:
                    kept.append(entry)
                else:
                    holdout.append({k: entry[k] for k in ("id", "hash", "path")})
    return kept, holdout


def collect_inspired(yaml_path: Path):
    import yaml
    doc = yaml.safe_load(open(yaml_path))
    return [{"id": s["id"], "hash": snippet_hash(s["code"]), "path": str(yaml_path.name),
             "code": s["code"]} for s in doc["songs"]]


# ------------------------------------------------------------ program map ---
# Pitched voices, keyed by Strudel sound name. Values are GM programs chosen to
# land in the checkpoint's MT3_FULL_PLUS buckets (Synth Lead 80-87, Synth Pad
# 88-95, Electric Bass 33-39, ...). A synth voice whose median pitch is below
# C3 becomes Synth Bass 38 regardless of waveform (bucket: Electric Bass).
SYNTH_PROGRAM = {
    "sawtooth": 81, "saw": 81, "supersaw": 81, "z_sawtooth": 81,
    "square": 80, "pulse": 80, "z_square": 80,
    "triangle": 80, "tri": 80, "z_triangle": 80, "sine": 80, "z_sine": 80,
}
OTHER_PROGRAM = {
    "piano": 0, "epiano": 2, "rhodes": 2, "organ": 16, "kalimba": 108,
    "guitar": 26, "gtr": 26, "bass": 38, "strings": 48, "pad": 88,
}
BASS_SPLIT_PITCH = 48  # below C3 -> synth bass
DEFAULT_PROGRAM = 81   # unknown pitched sound -> Synth Lead (sawtooth)
DEFAULT_SOUND = "triangle"  # note(...) without .s() plays Strudel's default synth

# Drum sample name -> GM percussion pitch. Every value is in a class of the
# training drum vocab (config.vocabulary.GM_DRUM_NOTES) — except that GM has
# no clap class, so cp -> 40 (Electric Snare; "Snare Drum" bucket, still
# distinct from sd=38 in the raw MIDI).
DRUM_PITCH = {
    "bd": 36, "sd": 38, "cp": 40, "clap": 40, "rim": 37, "click": 37,
    "hh": 42, "sh": 42, "oh": 46, "cb": 56, "cr": 49, "rd": 51,
    "lt": 45, "mt": 48, "ht": 50, "tb": 54, "perc": 63,
}


def base_sound(s: str) -> str:
    return re.sub(r":\d+$", "", s or "").lower() or DEFAULT_SOUND


def assign_programs(events):
    """Per song: one program per pitched sound name (median-pitch bass rule)."""
    by_sound = {}
    for ev in events:
        if ev["kind"] == "pitched":
            by_sound.setdefault(base_sound(ev.get("s", "")), []).append(ev["pitch"])
    programs, unknown = {}, set()
    for s, pitches in by_sound.items():
        if float(np.median(pitches)) < BASS_SPLIT_PITCH:
            programs[s] = 38
        elif s in SYNTH_PROGRAM:
            programs[s] = SYNTH_PROGRAM[s]
        elif s in OTHER_PROGRAM:
            programs[s] = OTHER_PROGRAM[s]
        else:
            programs[s] = DEFAULT_PROGRAM
            unknown.add(s)
    return programs, unknown


# ----------------------------------------------------------- song pipeline ---
def run_node(script: str, song_js: Path, extra: list) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["node", str(REPO / "data_gen" / script), "--file", str(song_js), *extra],
        cwd=REPO / "data_gen", capture_output=True, text=True, timeout=NODE_TIMEOUT,
    )


def node_error(r: subprocess.CompletedProcess) -> str:
    """The actual Error line from a node crash, not the last stack frame."""
    text = (r.stderr or "") + (r.stdout or "")
    for line in text.splitlines():
        if re.search(r"(^\w*Error|not defined|not a function|WARNING)", line.strip()):
            return line.strip()[:160]
    lines = text.strip().splitlines()
    return lines[-1][:160] if lines else "?"


def first_audio_onset(wav_path: Path, threshold=0.02) -> float:
    """Time of the first sample above threshold — cheap alignment probe."""
    with wave.open(str(wav_path)) as w:
        sr, n = w.getframerate(), w.getnframes()
        x = np.frombuffer(w.readframes(n), dtype="<i2").astype(np.float32) / 32768
    idx = np.argmax(np.abs(x) > threshold)
    return float(idx / sr) if np.abs(x[idx]) > threshold else float("nan")


def build_song(song, out_dir: Path, cycles: int, amt, stats):
    Note, note2note_event, validate_notes, trim_overlapping_notes, note_event2midi = amt
    sid = song["id"]
    d = out_dir / sid
    d.mkdir(parents=True, exist_ok=True)
    song_js = d / "song.js"
    song_js.write_text(song["code"].rstrip() + "\n")

    # 1. ground-truth labels (also the validity gate)
    labels_json = d / "labels.json"
    r = run_node("extract_labels.mjs", song_js, ["--cycles", str(cycles), "--out", str(labels_json)])
    if r.returncode != 0:
        stats["failed_eval"].append((sid, node_error(r)))
        return None
    labels = json.loads(labels_json.read_text())
    usable = [e for e in labels["events"] if e["kind"] in ("pitched", "drum")]
    if not usable:
        stats["no_events"].append(sid)
        return None
    dropped_samples = labels["n_events"] - len(usable)
    if dropped_samples:
        stats["sample_events_dropped"] += dropped_samples

    # 2. audio: 16 kHz mono, tempo identical to the labels by construction
    wav = d / "mix.wav"
    r = run_node("render_offline.mjs", song_js,
                 ["--cycles", str(cycles), "--sr", "16000", "--ch", "1", "--out", str(wav)])
    if r.returncode != 0:
        stats["failed_render"].append((sid, node_error(r)))
        return None

    # 3. YourMT3 Note / NoteEvent files
    programs, unknown = assign_programs(usable)
    stats["unknown_sounds"] |= unknown
    notes = []
    for ev in usable:
        if ev["kind"] == "drum":
            pitch = DRUM_PITCH.get(base_sound(ev.get("s", "")))
            if pitch is None:
                stats["unknown_drums"].add(base_sound(ev.get("s", "")))
                continue
            notes.append(Note(is_drum=True, program=128, onset=ev["t"],
                              offset=ev["t"] + 0.01, pitch=pitch, velocity=1))
        else:
            notes.append(Note(is_drum=False, program=programs[base_sound(ev.get("s", ""))],
                              onset=ev["t"], offset=ev["t"] + max(ev["dur"], 0.01),
                              pitch=ev["pitch"], velocity=1))
    if not notes:
        stats["no_events"].append(sid)
        return None
    notes = sorted(notes, key=lambda n: (n.onset, n.is_drum, n.pitch))
    notes = trim_overlapping_notes(notes)
    notes = validate_notes(notes)
    note_events = note2note_event(notes)

    program_list = sorted({n.program for n in notes if not n.is_drum})
    has_drum = any(n.is_drum for n in notes)
    notes_file = d / f"{sid}_notes.npy"
    note_events_file = d / f"{sid}_note_events.npy"
    duration = labels["duration_s"]
    np.save(notes_file, {"strudel_id": sid, "program": program_list + ([128] if has_drum else []),
                         "is_drum": [0] * len(program_list) + ([1] if has_drum else []),
                         "duration_sec": duration, "notes": notes},
            allow_pickle=True, fix_imports=False)
    np.save(note_events_file, {"strudel_id": sid, "program": program_list + ([128] if has_drum else []),
                               "is_drum": [0] * len(program_list) + ([1] if has_drum else []),
                               "duration_sec": duration, "note_events": note_events},
            allow_pickle=True, fix_imports=False)
    midi_file = d / f"{sid}.mid"
    note_event2midi(note_events, str(midi_file))

    # 4. alignment probe: first label onset vs first audible sample
    label_t0 = min(n.onset for n in notes)
    audio_t0 = first_audio_onset(wav)
    if not np.isnan(audio_t0):
        stats["onset_deltas"].append(audio_t0 - label_t0)

    with wave.open(str(wav)) as w:
        n_frames = w.getnframes()
    return {
        "strudel_id": sid,
        "n_frames": n_frames,
        "mix_audio_file": str(wav),
        "notes_file": str(notes_file),
        "note_events_file": str(note_events_file),
        "midi_file": str(midi_file),
        "program": program_list + ([128] if has_drum else []),
        "is_drum": [0] * len(program_list) + ([1] if has_drum else []),
    }


def split_of(song_hash: str) -> str:
    """90/5/5 by an independent hash bit-range (stable forever)."""
    v = int(song_hash[8:16], 16) / 0xFFFFFFFF
    return "train" if v < 0.9 else ("validation" if v < 0.95 else "test")


# ------------------------------------------------------------------- main ---
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-home", type=Path, default=REPO / "datasets")
    ap.add_argument("--amt-src", type=Path, default=REPO / "models" / "YourMT3" / "amt" / "src")
    ap.add_argument("--corpus-dir", type=Path, default=REPO / "corpus" / "github",
                    help="corpus root (submodules must be initialized)")
    ap.add_argument("--corpus-fraction", type=float, default=0.5)
    ap.add_argument("--cycles", type=int, default=8)
    ap.add_argument("--limit", type=int, help="stop after N songs (smoke test)")
    ap.add_argument("--sources", default="corpus,inspired")
    ap.add_argument("--index-only", action="store_true",
                    help="rebuild file lists from already-built song folders")
    args = ap.parse_args()

    if not args.amt_src.exists():
        sys.exit(f"amt/src not found at {args.amt_src} — run scripts/fetch_yourmt3.py "
                 f"or pass --amt-src")
    amt = import_amt(args.amt_src)

    out_dir = args.data_home / "strudel_yourmt3_16k"
    index_dir = args.data_home / "yourmt3_indexes"
    index_dir.mkdir(parents=True, exist_ok=True)

    songs = []
    sources = args.sources.split(",")
    if "corpus" in sources:
        if not any(args.corpus_dir.glob("*/*")):
            sys.exit(f"{args.corpus_dir} is empty — run: git submodule update --init --recursive")
        kept, holdout = collect_corpus(args.corpus_dir, args.corpus_fraction)
        (args.data_home / "strudel_holdout.json").write_text(json.dumps({
            "note": "corpus snippets WITHHELD from training (eval only)",
            "fraction_kept_for_training": args.corpus_fraction,
            "holdout": holdout}, indent=2) + "\n")
        print(f"corpus: {len(kept)} snippets kept for training, {len(holdout)} withheld -> strudel_holdout.json")
        songs += kept
    if "inspired" in sources:
        inspired = collect_inspired(REPO / "dataset" / "generated_500_inspired.yaml")
        print(f"inspired: {len(inspired)} songs")
        songs += inspired
    if args.limit:
        songs = songs[: args.limit]

    stats = {"failed_eval": [], "failed_render": [], "no_events": [],
             "sample_events_dropped": 0, "unknown_sounds": set(), "unknown_drums": set(),
             "onset_deltas": []}
    entries = {}

    if args.index_only:
        for song in songs:
            d = out_dir / song["id"]
            nf = d / f"{song['id']}_notes.npy"
            if not nf.exists():
                continue
            meta = np.load(nf, allow_pickle=True).item()
            with wave.open(str(d / "mix.wav")) as w:
                n_frames = w.getnframes()
            entries[song["hash"]] = {
                "strudel_id": song["id"], "n_frames": n_frames,
                "mix_audio_file": str(d / "mix.wav"), "notes_file": str(nf),
                "note_events_file": str(d / f"{song['id']}_note_events.npy"),
                "midi_file": str(d / f"{song['id']}.mid"),
                "program": meta["program"], "is_drum": meta["is_drum"]}
    else:
        for i, song in enumerate(songs):
            try:
                entry = build_song(song, out_dir, args.cycles, amt, stats)
            except subprocess.TimeoutExpired:
                stats["failed_render"].append((song["id"], f"node timeout ({NODE_TIMEOUT}s)"))
                entry = None
            except Exception as e:  # keep the batch going; log the song
                stats["failed_eval"].append((song["id"], f"{type(e).__name__}: {e}"))
                entry = None
            if entry:
                entries[song["hash"]] = entry
            if (i + 1) % 25 == 0 or i + 1 == len(songs):
                print(f"  [{i + 1}/{len(songs)}] ok={len(entries)} "
                      f"eval_fail={len(stats['failed_eval'])} render_fail={len(stats['failed_render'])} "
                      f"empty={len(stats['no_events'])}")

    # index files, split by hash
    splits = {"train": {}, "validation": {}, "test": {}}
    for h, entry in entries.items():
        s = splits[split_of(h)]
        s[str(len(s))] = entry
    for split, file_list in splits.items():
        out = index_dir / f"strudel_{split}_file_list.json"
        out.write_text(json.dumps(file_list, indent=4) + "\n")
        print(f"wrote {out} ({len(file_list)} songs)")

    # report
    if stats["onset_deltas"]:
        d = np.array(stats["onset_deltas"])
        print(f"\nonset alignment (audio first-transient minus first label onset):")
        print(f"  median {np.median(d) * 1000:+.1f} ms | p90 {np.percentile(d, 90) * 1000:+.1f} ms "
              f"| n={len(d)}  (attack envelopes make small positive values expected)")
        if abs(np.median(d)) > 0.03:
            print("  WARNING: median > 30 ms — check tempo handling before training!")
    if stats["unknown_sounds"]:
        print(f"unknown pitched sounds -> program {DEFAULT_PROGRAM}: {sorted(stats['unknown_sounds'])[:20]}")
    if stats["unknown_drums"]:
        print(f"unknown drum sounds (events dropped): {sorted(stats['unknown_drums'])[:20]}")
    if stats["sample_events_dropped"]:
        print(f"unpitched sample events dropped: {stats['sample_events_dropped']}")
    for key in ("failed_eval", "failed_render", "no_events"):
        if stats[key]:
            print(f"{key}: {len(stats[key])}")
            for item in stats[key][:8]:
                print(f"   {item}")
    (args.data_home / "strudel_build_report.json").write_text(json.dumps(
        {k: (sorted(v) if isinstance(v, set) else v) for k, v in stats.items()},
        indent=2, default=str) + "\n")


if __name__ == "__main__":
    main()
