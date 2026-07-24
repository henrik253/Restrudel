#!/usr/bin/env python3
"""Track B B3 — render MIDI through a REAL software synth (Avenue A).

Rationale + evaluation: docs/roadmap.md (Phase 8 B3). This is the
thesis-critical path: give the model subtractive/FM/wavetable timbres it has
never seen, with perfectly-aligned labels (we render *from* the MIDI, so the
notes ARE the ground truth).

**Coverage, not a patch list.** The original plan mapped each GM program to a
factory patch name. Two findings changed that (2026-07-17):
  - Surge XT's factory patches are `.fxp`, and DawDreamer's `load_preset` is the
    VST2 path — it returns False for a VST3-hosted Surge. Only `.vstpreset`
    loads, which Surge does not ship.
  - Surge exposes all 2855 parameters live, including 12 oscillator ALGORITHMS
    (Classic/Wavetable/FM2/FM3/String/Twist/...) and 34 filter models.
Driving those directly is both available *and* what B4 actually asks for: span
the timbre space instead of mirroring a fixed patch list (a 26-patch list is
exactly the Slakh trap this project exists to escape).

Drums are dropped from BOTH audio and labels: Surge is not a drum machine, and
unrendered-but-labeled percussion would be a phantom-label bug. Drum competence
comes from EGMD/Strudel/NES-MDB instead.

Needs DawDreamer + a Surge XT VST3. Verified on macOS 2026-07-17: headless
plugin load ~1.6 s, offline render ~136x realtime, no xvfb.

Usage:
  python scripts/dataset/render_synths.py --data-home $DATA_HOME \
      --surge "$HOME/Library/Audio/Plug-Ins/VST3/Surge XT.vst3" --limit 50
"""
import argparse
import hashlib
import json
import sys
import wave
from pathlib import Path

import numpy as np

SR = 16000            # YourMT3 frontend rate
RENDER_SR = 44100     # render high, resample down: 16 kHz synthesis aliases
BLOCK = 512
MAX_SECONDS = 120     # cap: a few pathological MIDIs would run for hours
# Rendered past the last note-off, then trimmed away. Without it the final notes
# are still sounding when the render window closes, and Surge's voices — never
# released — drone into the NEXT stem's render at t=0 (measured 2026-07-17:
# every render after the first started at 0.000s instead of the true onset,
# which silently misaligns audio from labels). Verified: with every note-off
# inside the window, repeated renders on one engine stay aligned.
RELEASE_TAIL_SECONDS = 2.0
# Silence rendered BEFORE the music and then discarded. The plugin emits a
# startup click in its first ~50 ms (measured: |x| up to 0.17 while the region
# should be silent); a model would read that as an onset at t=0 in every song.
# Stems are shifted by this much and the lead-in is cut, so the click lands in
# the discarded audio and the labels keep their original times.
PREROLL_SECONDS = 0.25
# A randomly sampled patch can filter a voice into near-silence (measured: a
# BP filter at low cutoff on a C6 lead). Its notes would then be labels with no
# audible evidence — teaching the model to hallucinate. Re-roll the patch a few
# times; a stem that stays inaudible is dropped from the audio AND the labels.
STEM_AUDIBLE_PEAK = 0.02
PATCH_ATTEMPTS = 4

# --- Surge XT VST3 parameter indices (verified against Surge XT 1.3.4) -------
# Names come from get_parameters_description(); values are normalized 0..1 and
# get_parameter_text() renders them ("Classic", "523.25 Hz", ...).
P_OSC1_TYPE = 256
P_FILTER1_TYPE = 317
P_FILTER1_CUTOFF = 319
P_FILTER1_RESONANCE = 320
P_AMP_EG_ATTACK = 329
P_AMP_EG_DECAY = 331
P_AMP_EG_SUSTAIN = 333
P_AMP_EG_RELEASE = 334

# Oscillator algorithms -> normalized parameter value. 'Audio In' is excluded:
# it synthesizes nothing without an input signal.
OSC_TYPES = {
    "Classic": 0.0, "Sine": 0.0503, "Wavetable": 0.1407, "S&H Noise": 0.2312,
    "FM3": 0.4121, "FM2": 0.5025, "Window": 0.593, "Modern": 0.6834,
    "String": 0.7739, "Twist": 0.8643, "Alias": 0.9548,
}
# A spread of filter characters (not all 34 — these span the useful space).
FILTER_TYPES = {
    "Off": 0.0, "LP 12 dB": 0.0201, "LP 24 dB": 0.0503,
    "LP Legacy Ladder": 0.0804, "HP 12 dB": 0.1106, "BP 12 dB": 0.1709,
    "LP Vintage Ladder": 0.2915, "LP OB-Xd 24 dB": 0.3518, "LP K35": 0.3819,
    "LP Diode Ladder": 0.4422, "LP Cutoff Warp": 0.4724, "BP 24 dB": 0.6834,
}

# GM program family -> oscillator algorithms that plausibly voice it. The point
# is DIVERSITY per class (rotated by hash), not one canonical timbre per
# program. Programs follow General MIDI.
PROGRAM_OSCILLATORS = {
    "keys": (["FM2", "FM3", "Wavetable", "Classic"], range(0, 8)),
    "organ": (["Classic", "Window", "Modern"], range(16, 24)),
    "bass": (["Classic", "Modern", "Wavetable", "FM2"], range(32, 40)),
    "string": (["String", "Wavetable", "Classic"], range(40, 52)),
    "brass": (["Classic", "Modern", "Wavetable"], range(56, 64)),
    "lead": (["Classic", "Modern", "Wavetable", "Twist", "Alias"], range(80, 88)),
    "pad": (["Wavetable", "Window", "Classic", "Twist"], range(88, 96)),
    "fx": (["S&H Noise", "Twist", "Window", "Wavetable"], range(96, 104)),
}
DEFAULT_OSCILLATORS = ["Classic", "Wavetable", "Modern"]


def oscillators_for(program: int) -> list:
    for oscs, programs in PROGRAM_OSCILLATORS.values():
        if program in programs:
            return oscs
    return DEFAULT_OSCILLATORS


def patch_rng(midi_id: str, program: int, attempt: int = 0) -> np.random.Generator:
    """Deterministic per (song, program, attempt): same input -> same timbre."""
    seed = int(hashlib.md5(f"{midi_id}:{program}:{attempt}".encode()).hexdigest()[:8], 16)
    return np.random.default_rng(seed)


def apply_patch(synth, rng, program: int) -> dict:
    """Sample a timbre for `program` and push it into the plugin.

    Continuous params are drawn to SPAN their range (B4/S1): cutoff across the
    audible band, envelopes from snappy to sustained. Returns the chosen
    settings, which are saved next to the render for inspection.
    """
    osc = str(rng.choice(oscillators_for(program)))
    filt = str(rng.choice(list(FILTER_TYPES)))
    cutoff = float(rng.uniform(0.25, 1.0))
    resonance = float(rng.beta(2, 5))          # mostly gentle, occasionally sharp
    synth.set_parameter(P_OSC1_TYPE, OSC_TYPES[osc])
    synth.set_parameter(P_FILTER1_TYPE, FILTER_TYPES[filt])
    synth.set_parameter(P_FILTER1_CUTOFF, cutoff)
    synth.set_parameter(P_FILTER1_RESONANCE, resonance)
    synth.set_parameter(P_AMP_EG_ATTACK, float(rng.beta(1.5, 6)))
    synth.set_parameter(P_AMP_EG_DECAY, float(rng.uniform(0.2, 0.8)))
    synth.set_parameter(P_AMP_EG_SUSTAIN, float(rng.uniform(0.3, 1.0)))
    synth.set_parameter(P_AMP_EG_RELEASE, float(rng.uniform(0.1, 0.6)))
    return {"osc": osc, "filter": filt, "cutoff": round(cutoff, 3),
            "resonance": round(resonance, 3)}


def pitched_only(midi_path: Path, out_midi: Path):
    """Rebuild `midi_path` as the notes-only MIDI we render AND label.

    The written file is the single source of truth for this song: both the audio
    and the labels derive from it, so they cannot disagree. Rebuilding (rather
    than filtering in place) drops three things on purpose:
      - drum tracks — Surge is not a drum machine, and labeling percussion we
        never render would be a phantom label;
      - pitch bends — they would slide the audio away from the pitch the label
        asserts;
      - control changes — a source CC7/CC11 can mute a stem, and our patch, not
        the source's mix automation, defines the timbre.
    Returns (pretty_midi object, duration) or (None, 0) if nothing survives.
    """
    import pretty_midi

    try:
        pm = pretty_midi.PrettyMIDI(str(midi_path))
    except Exception:
        return None, 0.0
    cap = min(pm.get_end_time(), MAX_SECONDS)
    if cap < 1.0:
        return None, 0.0

    clean = pretty_midi.PrettyMIDI()      # fresh 120 BPM map; notes are seconds
    for inst in pm.instruments:
        if inst.is_drum:
            continue
        notes = [pretty_midi.Note(velocity=n.velocity, pitch=n.pitch,
                                  start=n.start, end=min(n.end, cap))
                 for n in inst.notes if n.start < cap and min(n.end, cap) > n.start]
        if not notes:
            continue
        voice = pretty_midi.Instrument(program=int(inst.program), is_drum=False)
        voice.notes = notes
        clean.instruments.append(voice)
    if not clean.instruments:
        return None, 0.0

    duration = clean.get_end_time()
    out_midi.parent.mkdir(parents=True, exist_ok=True)
    clean.write(str(out_midi))
    return clean, duration


def render_stem(eng, synth, insts, program: int, midi_id: str, duration: float,
                tmp_dir: Path):
    """Render one GM program, re-rolling its patch until the result is audible.

    Returns (mono at RENDER_SR, patch) or (None, None) if every attempt stayed
    below STEM_AUDIBLE_PEAK — the caller then drops the program's labels too.
    """
    import pretty_midi

    # shifted by PREROLL_SECONDS; the lead-in is cut back off after render
    stem = pretty_midi.PrettyMIDI()
    for inst in insts:
        voice = pretty_midi.Instrument(program=program, is_drum=False)
        voice.notes = [pretty_midi.Note(velocity=n.velocity, pitch=n.pitch,
                                        start=n.start + PREROLL_SECONDS,
                                        end=n.end + PREROLL_SECONDS)
                       for n in inst.notes]
        stem.instruments.append(voice)
    stem_path = tmp_dir / f"{midi_id}_p{program}.mid"
    stem.write(str(stem_path))

    start = int(PREROLL_SECONDS * RENDER_SR)
    try:
        for attempt in range(PATCH_ATTEMPTS):
            patch = apply_patch(synth, patch_rng(midi_id, program, attempt), program)
            patch["program"] = program
            synth.clear_midi()
            synth.load_midi(str(stem_path), all_events=True)
            eng.load_graph([(synth, [])])
            # render the pre-roll AND a release tail, then keep only the music
            eng.render(PREROLL_SECONDS + duration + RELEASE_TAIL_SECONDS)
            audio = eng.get_audio()
            if audio.size == 0:
                continue
            mono = audio.mean(axis=0) if audio.ndim > 1 else audio
            mono = mono[start: start + int(duration * RENDER_SR)]
            if np.isfinite(mono).all() and float(np.abs(mono).max()) >= STEM_AUDIBLE_PEAK:
                patch["attempt"] = attempt
                return mono, patch
    finally:
        stem_path.unlink(missing_ok=True)
    return None, None


def render_one(eng, synth, pm, midi_id: str, duration: float, tmp_dir: Path):
    """Render every GM program of `pm` with its own timbre; sum to mono.

    Returns (mono float32 at SR, [patch dicts], {audible programs}); the third
    value lets the caller label only what is actually audible.
    """
    from scipy.signal import resample_poly

    by_program: dict = {}
    for inst in pm.instruments:
        by_program.setdefault(int(inst.program), []).append(inst)

    mix, patches, audible = None, [], set()
    for program, insts in by_program.items():
        mono, patch = render_stem(eng, synth, insts, program, midi_id,
                                  duration, tmp_dir)
        if mono is None:
            continue                      # inaudible: excluded from labels below
        patches.append(patch)
        audible.add(program)
        if mix is None:
            mix = mono
        else:
            n = min(len(mix), len(mono))
            mix = mix[:n] + mono[:n]

    if mix is None or not np.isfinite(mix).all():
        return None, [], set()
    peak = float(np.abs(mix).max())
    if peak < 1e-4:
        return None, [], set()
    mix = mix / peak * 0.89               # headroom; keeps relative dynamics
    return resample_poly(mix, SR, RENDER_SR).astype(np.float32), patches, audible


def write_wav(path: Path, x: np.ndarray) -> int:
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    return len(x)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-home", type=Path, required=True)
    ap.add_argument("--amt-src", type=Path,
                    default=Path("models/YourMT3/amt/src"),
                    help="YourMT3 amt/src (for utils.midi/note2event)")
    ap.add_argument("--surge", required=True, help="path to Surge XT.vst3")
    ap.add_argument("--midi-dir", type=Path,
                    help="directory of source MIDIs "
                         "(default: <data-home>/metamidi_electronic)")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--dry-run", action="store_true",
                    help="report the program->oscillator coverage, render nothing")
    args = ap.parse_args()

    if args.dry_run:
        for name, (oscs, programs) in PROGRAM_OSCILLATORS.items():
            print(f"  {name:8} programs {programs.start:3}-{programs.stop - 1:3} -> {oscs}")
        print(f"  {'default':8} {'':11} -> {DEFAULT_OSCILLATORS}")
        return

    midi_dir = args.midi_dir or args.data_home / "metamidi_electronic"
    midis = sorted(midi_dir.glob("*.mid"))
    if not midis:
        sys.exit(f"no MIDIs in {midi_dir} — run prepare_metamidi.py first")
    if args.limit:
        midis = midis[: args.limit]
    print(f"{len(midis)} source MIDIs from {midi_dir}")

    if not Path(args.surge).exists():
        sys.exit(f"Surge XT VST3 not found at {args.surge}")
    try:
        import dawdreamer as daw
    except ImportError:
        sys.exit("dawdreamer not installed — 'uv pip install dawdreamer'")
    sys.path.insert(0, str(args.amt_src))
    from utils.midi import midi2note
    from utils.note2event import note2note_event

    out_dir = args.data_home / "synth_yourmt3_16k"
    index_dir = args.data_home / "yourmt3_indexes"
    index_dir.mkdir(parents=True, exist_ok=True)
    tmp_dir = args.data_home / "_synth_tmp"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    eng = daw.RenderEngine(RENDER_SR, BLOCK)
    synth = eng.make_plugin_processor("synth", str(args.surge))

    entries, skipped, silent, dropped_voices = {}, 0, 0, 0
    for i, midi_path in enumerate(midis):
        midi_id = midi_path.stem
        song_dir = out_dir / midi_id
        pm, duration = pitched_only(midi_path, song_dir / f"{midi_id}.mid")
        if pm is None:
            skipped += 1
            continue
        try:
            audio, patches, audible = render_one(eng, synth, pm, midi_id,
                                                 duration, tmp_dir)
        except Exception:
            audio, patches, audible = None, [], set()
        if audio is None:
            silent += 1
            continue
        if audible != {int(i.program) for i in pm.instruments}:
            # Some voice never became audible: rewrite the label MIDI without it
            # so we never assert a note the audio does not contain.
            pm.instruments = [i for i in pm.instruments if int(i.program) in audible]
            pm.write(str(song_dir / f"{midi_id}.mid"))
            dropped_voices += 1
        try:
            notes, label_dur = midi2note(str(song_dir / f"{midi_id}.mid"),
                                         binary_velocity=True, ch_9_as_drum=True,
                                         trim_overlap=True, fix_offset=True,
                                         quantize=True, verbose=0)
            note_events = note2note_event(notes)
        except Exception:
            skipped += 1
            continue
        if not notes:
            skipped += 1
            continue
        n_frames = write_wav(song_dir / "mix.wav", audio)
        programs = sorted({n.program for n in notes if not n.is_drum})
        meta = {"synth_id": midi_id, "program": programs,
                "is_drum": [0] * len(programs), "duration_sec": label_dur}
        np.save(song_dir / f"{midi_id}_notes.npy", {**meta, "notes": notes},
                allow_pickle=True, fix_imports=False)
        np.save(song_dir / f"{midi_id}_note_events.npy",
                {**meta, "note_events": note_events},
                allow_pickle=True, fix_imports=False)
        (song_dir / "patches.json").write_text(json.dumps(patches, indent=2))
        entries[midi_id] = {
            "synth_id": midi_id, "n_frames": n_frames,
            "mix_audio_file": str(song_dir / "mix.wav"),
            "notes_file": str(song_dir / f"{midi_id}_notes.npy"),
            "note_events_file": str(song_dir / f"{midi_id}_note_events.npy"),
            "midi_file": str(song_dir / f"{midi_id}.mid"),
            "program": programs, "is_drum": [0] * len(programs)}
        if (i + 1) % 25 == 0 or i + 1 == len(midis):
            print(f"  [{i + 1}/{len(midis)}] ok={len(entries)} "
                  f"skipped={skipped} silent={silent}", flush=True)

    # 90/5/5 by id hash. These are OUR renders of third-party MIDI, so there is
    # no canonical split to honour; the hash keeps it stable across runs.
    splits = {"train": {}, "validation": {}, "test": {}}
    for midi_id, entry in entries.items():
        h = int(hashlib.md5(midi_id.encode()).hexdigest()[8:16], 16) / 0xFFFFFFFF
        split = "train" if h < 0.9 else ("validation" if h < 0.95 else "test")
        s = splits[split]
        s[str(len(s))] = entry
    for split, fl in splits.items():
        out = index_dir / f"synth_{split}_file_list.json"
        out.write_text(json.dumps(fl, indent=4) + "\n")
        print(f"wrote {out.name} ({len(fl)} songs)")
    print(f"rendered {len(entries)}; skipped {skipped} (no pitched content / "
          f"label failure); {silent} silent renders; {dropped_voices} songs had "
          f"an inaudible voice dropped from their labels")


if __name__ == "__main__":
    main()
