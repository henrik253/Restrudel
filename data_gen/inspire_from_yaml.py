#!/usr/bin/env python3
"""
DEPRECATED / reference only. Superseded by enhance_samples.py + collate_enhanced.py
(subagent enhancement), which keep each sketch's character instead of emitting a
fixed random template. Its default paths still point at the pre-batch-layout files
and it is no longer part of the pipeline; kept for reference.

Recompose the raw generated Strudel sketches into fuller songs.

The sampler in generate.mjs is useful for exploring corpus probabilities, but
its output can mix incompatible sound families inside one voice. This script
treats each sampled song as inspiration only: it extracts hints (tempo-ish seed,
pitch tokens, synth/sample tokens), then writes a coherent four/five-voice
Strudel arrangement with drums, bass, lead, and optional pad.
"""

from __future__ import annotations

import argparse
import random
import re
from pathlib import Path

import yaml


KEYS = ["c", "d", "e", "f", "g", "a", "bb", "eb", "f#", "ab"]
MODES = ["minor", "dorian", "phrygian", "lydian", "major"]
DRUM_BANKS = ["tr909", "rolandtr808", "linn9000"]
SYNTHS = ["sawtooth", "square", "triangle", "supersaw", "sine", "pulse"]
LEAD_SYNTHS = ["triangle", "sine", "sawtooth", "square"]
PAD_SYNTHS = ["supersaw", "sawtooth", "triangle"]

DRUM_TOKENS = {
    "bd",
    "sd",
    "hh",
    "oh",
    "cp",
    "cr",
    "rd",
    "lt",
    "mt",
    "ht",
    "rim",
}
SYNTH_TOKENS = {"sawtooth", "square", "triangle", "supersaw", "sine", "pulse", "saw"}

NOTE_RE = re.compile(r"^[A-Ga-g][#b]?\d(?:[:*!@][0-9.]+)?$")
DEGREE_RE = re.compile(r"^-?\d+(?:[:*!@][0-9.]+)?$")
CALL_RE = re.compile(r"\b(note|n|s|sound)\(\"([^\"]*)\"\)")


def base_token(token: str) -> str:
    return re.split(r"[:*!@]", token, maxsplit=1)[0]


def tokens_from(code: str) -> dict[str, list[str]]:
    out = {"notes": [], "degrees": [], "drums": [], "synths": [], "samples": []}
    for fn, value in CALL_RE.findall(code):
        for token in value.split():
            base = base_token(token)
            if base == "~":
                continue
            if base in DRUM_TOKENS:
                out["drums"].append(base)
            elif base in SYNTH_TOKENS or base.startswith("z_"):
                out["synths"].append(base.removeprefix("z_"))
            elif NOTE_RE.match(token):
                out["notes"].append(token)
            elif DEGREE_RE.match(token):
                out["degrees"].append(base)
            elif base.startswith("gm_"):
                out["samples"].append(base)
    return out


def pick(rng: random.Random, values: list[str], fallback: list[str]) -> str:
    pool = values or fallback
    return rng.choice(pool)


def clean_degrees(values: list[str], rng: random.Random, min_len: int = 8) -> list[int]:
    degrees: list[int] = []
    for value in values:
        try:
            n = int(value)
        except ValueError:
            continue
        if -12 <= n <= 24:
            degrees.append(n)
    roots = [
        [0, 0, 3, 5, 7, 5, 3, 2],
        [0, 2, 4, 7, 9, 7, 4, 2],
        [0, 3, 7, 10, 7, 5, 3, 0],
        [0, 1, 0, 3, 5, 3, 7, 5],
        [0, 2, 5, 7, 10, 7, 5, 3],
    ]
    if not degrees:
        degrees = rng.choice(roots).copy()
    elif len(set(degrees)) < 3:
        # Keep the source's center of gravity, but compose a real contour around it.
        offset = degrees[0]
        contour = rng.choice(roots)
        degrees = [offset + step for step in contour]
    while len(degrees) < min_len:
        degrees.extend(degrees[: max(1, min_len - len(degrees))])
    return degrees[:16]


def rhythmize(values: list[int], rng: random.Random, length: int = 8) -> str:
    values = (values * ((length // len(values)) + 1))[:length]
    slots: list[str] = []
    for i, value in enumerate(values):
        if i in (1, 5) and rng.random() < 0.35:
            slots.append("~")
        else:
            suffix = "@2" if rng.random() < 0.12 else ""
            slots.append(f"{value}{suffix}")
    return " ".join(slots)


def note_phrase(notes: list[str], rng: random.Random) -> str:
    if len(notes) >= 4:
        phrase = notes[:8]
    else:
        phrase = rng.choice(
            [
                ["c3", "eb3", "g3", "bb3", "g3", "eb3"],
                ["a2", "c3", "e3", "g3", "e3", "c3"],
                ["f2", "ab2", "c3", "eb3", "c3", "ab2"],
                ["d3", "f3", "a3", "c4", "a3", "f3"],
            ]
        )
    return " ".join(phrase[:8])


def chord_scale(key: str, mode: str) -> str:
    return f"{key}:{mode}"


def recomposed_song(source: dict, index: int) -> dict:
    seed = int(source["seed"])
    rng = random.Random(seed * 7919 + index)
    hints = tokens_from(source["code"])

    key = pick(rng, [], KEYS)
    mode = pick(rng, [], MODES)
    scale = chord_scale(key, mode)
    bpm = rng.choice([96, 104, 112, 118, 124, 128, 132, 138, 145, 150])
    bank = pick(rng, [], DRUM_BANKS)

    bass_synth = pick(rng, hints["synths"], SYNTHS)
    lead_synth = pick(rng, [s for s in hints["synths"] if s != bass_synth], LEAD_SYNTHS)
    pad_synth = pick(rng, [s for s in hints["synths"] if s not in {bass_synth, lead_synth}], PAD_SYNTHS)

    degrees = clean_degrees(hints["degrees"], rng)
    bass = rhythmize(degrees, rng, 8)
    lead = rhythmize([d + 12 for d in reversed(degrees[:8])], rng, 8)
    pad = note_phrase(hints["notes"], rng)

    cutoff_low = rng.choice([280, 320, 380, 450, 520, 650])
    cutoff_high = rng.choice([900, 1100, 1400, 1800, 2200])
    res = rng.choice([5, 6, 7, 8, 9])
    room = rng.choice([0.25, 0.35, 0.45, 0.55])
    delay = rng.choice([0.25, 0.333, 0.375, 0.5])

    kick_pattern = rng.choice(
        [
            "bd ~ sd ~ bd bd sd ~",
            "bd*4",
            "bd ~ ~ sd ~ bd ~ sd",
            "bd ~ sd ~ bd ~ sd bd",
        ]
    )
    hat_pattern = rng.choice(
        [
            "hh*8",
            "~ hh hh ~ hh ~ oh ~",
            "hh*16",
            "~ hh ~ hh oh hh ~ hh",
        ]
    )

    lines = [
        f"setcpm({bpm}/4)",
        "",
        f'$: s("{kick_pattern}").bank("{bank}").gain(.8)',
        "",
        f'$: s("{hat_pattern}").bank("{bank}").gain(.18).hpf(6200).room(.15)',
        "",
        f'$: n("{bass}").scale("{scale}").s("{bass_synth}")',
        f"  .lpf(\"<{cutoff_low} {cutoff_high} {cutoff_low * 2} {cutoff_low}>\").resonance({res}).gain(.5).release(.12)",
        "",
        f'$: n("{lead}").scale("{scale}").s("{lead_synth}")',
        f"  .gain(.22).delay({delay}).room({room})",
    ]

    if rng.random() < 0.72:
        lines.extend(
            [
                "",
                f'$: note("{pad}").s("{pad_synth}")',
                f"  .lpf({rng.choice([700, 850, 1000, 1200])}).attack(.05).release(.55).gain(.28).room(.5)",
            ]
        )

    code = "\n".join(lines) + "\n"
    return {
        "id": f"inspired_{index:03d}",
        # The source YAML ids are like 1_0; YAML parses unquoted 1_0 as an int.
        # Reconstruct the original id from the seed for stable lineage.
        "inspired_by": f"1_{seed - 1}",
        "source_seed": seed,
        "bpm": bpm,
        "key": key,
        "mode": mode,
        "voices": sum(1 for line in lines if line.startswith("$:")),
        "code": code,
    }


def write_yaml_block(path: Path, songs: list[dict]) -> None:
    with path.open("w", encoding="utf-8") as f:
        f.write("generator: data_gen/inspire_from_yaml.py\n")
        f.write("source: dataset/generated_500.yaml\n")
        f.write(f"count: {len(songs)}\n")
        f.write("songs:\n")
        for song in songs:
            f.write(f"  - id: \"{song['id']}\"\n")
            f.write(f"    inspired_by: \"{song['inspired_by']}\"\n")
            f.write(f"    source_seed: {song['source_seed']}\n")
            f.write(f"    bpm: {song['bpm']}\n")
            f.write(f"    key: {song['key']}\n")
            f.write(f"    mode: {song['mode']}\n")
            f.write(f"    voices: {song['voices']}\n")
            f.write("    code: |\n")
            for line in song["code"].splitlines():
                f.write(f"      {line}\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="dataset/generated_500.yaml")
    parser.add_argument("--output", default="dataset/generated_500_inspired.yaml")
    args = parser.parse_args()

    data = yaml.safe_load(Path(args.input).read_text(encoding="utf-8"))
    songs = [recomposed_song(song, i) for i, song in enumerate(data["songs"])]
    write_yaml_block(Path(args.output), songs)
    print(f"wrote {len(songs)} inspired songs to {args.output}")


if __name__ == "__main__":
    main()
