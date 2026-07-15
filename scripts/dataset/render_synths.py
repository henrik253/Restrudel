#!/usr/bin/env python3
"""Track B B3 — render MIDI through REAL software synths (Avenue A). SCAFFOLD.

Rationale + evaluation: docs/external_electronic_data_B3.md. This is the
thesis-critical path: give the model subtractive/FM/wavetable timbres it has
never seen, with perfectly-aligned labels (we render *from* the MIDI, so the
notes ARE the ground truth).

Pipeline position: `prepare_lakh.py --render none` filters LMD to electronic
tracks, writes labels, and lists them in `lakh_staging_file_list.json` with a
`midi_file` and a target `mix_audio_file` (no audio yet). THIS script renders
that audio through real synths and promotes staging -> the loader-ready
`lakh_{train,validation,test}_file_list.json` (same 90/5/5 md5 split as
prepare_lakh's builtin path). MetaMIDI/GigaMIDI feedstock (B3 Avenue D) can be
staged the same way.

>>> COLAB-ONLY, and the patch map below is a STARTER, not final. <<<
Needs: dawdreamer (pip), and VST3 synths (Surge XT / Dexed / Vital) installed on
the VM. De-risk first (see the doc): confirm the VST3s instantiate headlessly
(may need xvfb-run) and measure the real-time factor before scaling. The real
work here is GM_SYNTH_PATCH_MAP + per-program patch selection, NOT the plumbing.

Usage (Colab):
  xvfb-run -a python scripts/dataset/render_synths.py \
      --data-home /content/drive/MyDrive/restrudel/datasets \
      --surge /path/to/Surge XT.vst3 --dexed /path/to/Dexed.vst3 --limit 50
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

SR = 16000  # YourMT3 frontend rate; render mono at SR

# --- GM program -> (engine, patch selector) -------------------------------
# STARTER MAP. Values are (engine_key, patch_hint). `patch_hint` is a substring
# matched against the engine's factory patch names (Surge/Dexed expose named
# presets); refine to specific presets once you audit each engine's library.
# Goal: DIVERSE timbres per class (avoid Slakh's 26-static-patch trap) — rotate
# patch_hint by (program, hash) at render time so the same GM program maps to
# several real patches across the dataset. Programs follow General MIDI.
GM_SYNTH_PATCH_MAP = {
    # synth lead 80-87 -> Surge subtractive/wavetable leads
    **{p: ("surge", "lead") for p in range(80, 88)},
    # synth pad 88-95 -> Surge pads
    **{p: ("surge", "pad") for p in range(88, 96)},
    # synth effects / voice 96-103 -> Surge FX/atmos
    **{p: ("surge", "fx") for p in range(96, 104)},
    # synth bass 38-39 (the class Slakh DROPPED entirely) -> Surge/Dexed bass
    38: ("surge", "bass"), 39: ("surge", "bass"),
    # FM-leaning electric pianos / bells -> Dexed (authentic DX7 FM)
    4: ("dexed", "e.piano"), 5: ("dexed", "e.piano"), 6: ("dexed", "harpsi"),
    # organs 16-20 -> Surge organ
    **{p: ("surge", "organ") for p in range(16, 21)},
    # synth strings 50-51, synth brass 62-63 -> Surge ensemble
    50: ("surge", "strings"), 51: ("surge", "strings"),
    62: ("surge", "brass"), 63: ("surge", "brass"),
}
DEFAULT_PATCH = ("surge", "lead")  # unmapped pitched program


def preflight(engines: dict):
    """Fail early + clearly if the Colab synth stack isn't present."""
    try:
        import dawdreamer  # noqa: F401
    except ImportError:
        sys.exit("dawdreamer not installed. On Colab: pip install dawdreamer. "
                 "This script is Colab-only (needs VST3 synths). See "
                 "docs/external_electronic_data_B3.md.")
    missing = [k for k, v in engines.items() if v and not Path(v).exists()]
    if missing:
        sys.exit(f"VST3 not found for: {missing}. Pass --surge/--dexed/--vital "
                 f"with real .vst3 paths.")


def make_engine(engines: dict):
    """Build a DawDreamer RenderEngine + a loaded-plugin cache. Real render:
      eng = daw.RenderEngine(SR, block)
      synth = eng.make_plugin_processor('synth', vst3_path)
      synth.load_preset(...) / synth.get_parameter(...)
      synth.load_midi(midi_path, all_events=True)
      eng.load_graph([(synth, [])]); eng.render(seconds)
      audio = eng.get_audio()   # (channels, n) -> downmix mono, resample SR
    """
    import dawdreamer as daw
    eng = daw.RenderEngine(SR, 512)
    plugins = {}
    for key, path in engines.items():
        if path:
            plugins[key] = eng.make_plugin_processor(key, str(path))
    return eng, plugins


def render_one(eng, plugins, midi_path: Path, out_wav: Path) -> bool:
    """Render one MIDI to a 16 kHz mono WAV by summing per-program synth stems.

    TODO (core work): split the MIDI by GM program, pick a real patch per
    program from GM_SYNTH_PATCH_MAP (rotate by hash for timbre diversity), render
    each stem offline via DawDreamer, sum to mono, resample to SR, write.
    Left unimplemented in the scaffold because it needs the live plugin stack to
    validate patch loading + the real-time factor first.
    """
    raise NotImplementedError(
        "per-program stem render — implement against the live DawDreamer + VST3 "
        "stack on Colab (see docstring + docs/external_electronic_data_B3.md)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-home", type=Path, required=True)
    ap.add_argument("--surge", default="", help="path to Surge XT.vst3")
    ap.add_argument("--dexed", default="", help="path to Dexed.vst3")
    ap.add_argument("--vital", default="", help="path to Vital.vst3")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--dry-run", action="store_true",
                    help="validate staging + patch map without rendering")
    args = ap.parse_args()

    engines = {"surge": args.surge, "dexed": args.dexed, "vital": args.vital}
    index_dir = args.data_home / "yourmt3_indexes"
    staging = index_dir / "lakh_staging_file_list.json"
    if not staging.exists():
        sys.exit(f"{staging} not found — run prepare_lakh.py --render none first")
    entries = list(json.load(open(staging)).values())
    if args.limit:
        entries = entries[: args.limit]
    avail = [k for k, v in engines.items() if v]
    print(f"{len(entries)} staged MIDIs; engines available: {avail or 'NONE'}")

    # program-coverage report — how many staged programs the map covers.
    all_programs = {p for e in entries for p in e.get("program", []) if p != 128}
    unmapped = sorted(p for p in all_programs if p not in GM_SYNTH_PATCH_MAP)
    print(f"programs present: {len(all_programs)}; unmapped -> DEFAULT_PATCH: {unmapped}")
    if args.dry_run:
        print("dry-run: staging + map validated; no audio rendered.")
        return

    preflight(engines)
    eng, plugins = make_engine(engines)

    rendered = {}
    for e in entries:
        midi_path = Path(e["midi_file"])
        out_wav = Path(e["mix_audio_file"])
        out_wav.parent.mkdir(parents=True, exist_ok=True)
        try:
            if render_one(eng, plugins, midi_path, out_wav):
                rendered[e["lakh_id"]] = e
        except NotImplementedError as err:
            sys.exit(f"{err}")

    # promote staging -> loader-ready splits (mirror prepare_lakh's 90/5/5).
    splits = {"train": {}, "validation": {}, "test": {}}
    for lakh_id, e in rendered.items():
        h = int(hashlib.md5(lakh_id.encode()).hexdigest()[8:16], 16) / 0xFFFFFFFF
        split = "train" if h < 0.9 else ("validation" if h < 0.95 else "test")
        s = splits[split]
        s[str(len(s))] = e
    for split, fl in splits.items():
        out = index_dir / f"lakh_{split}_file_list.json"
        out.write_text(json.dumps(fl, indent=4) + "\n")
        print(f"wrote {out} ({len(fl)} songs)")


if __name__ == "__main__":
    main()
