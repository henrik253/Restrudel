#!/usr/bin/env python3
"""MIDI -> Strudel code via an LLM (claude-haiku-4-5).

Closes the loop of the prototype pipeline:
    Strudel -> WAV -> YourMT3+ -> MIDI -> (this script) -> Strudel'

The generated code need not match the original source; it must *sound* the
same. The MIDI is quantized to a 16th-note step grid per voice and handed to
the model as text; the returned code is validated by evaluating it with the
real Strudel engine (queryArc in Node — the same validity gate Phase 2 uses)
and retried once with the error message if it fails.

LLM backend: the Anthropic Python SDK when credentials are available
(ANTHROPIC_API_KEY or an `ant auth login` profile); otherwise falls back to
`claude -p --model claude-haiku-4-5` (Claude Code headless mode) — same
prompt, same model.

Usage: .venv/bin/python scripts/midi_to_strudel.py input.mid [-o out.js]
"""
import argparse
import json
import re
import subprocess
import sys
from collections import defaultdict
from fractions import Fraction
from pathlib import Path

import mido

REPO = Path(__file__).resolve().parent.parent
MODEL = "claude-haiku-4-5"
STEPS_PER_BAR = 16  # 16th-note grid, 4/4

# GM drum note -> Strudel sample name (the corpus's bd/sd/hh/cp vocabulary)
GM_DRUMS = {
    35: "bd", 36: "bd", 37: "rim", 38: "sd", 39: "cp", 40: "sd",
    41: "lt", 42: "hh", 43: "lt", 44: "hh", 45: "mt", 46: "oh",
    47: "mt", 48: "ht", 49: "crash", 50: "ht", 51: "ride", 57: "crash",
}

NOTE_NAMES = ["c", "cs", "d", "eb", "e", "f", "fs", "g", "gs", "a", "bb", "b"]


def midi_note_name(n: int) -> str:
    return f"{NOTE_NAMES[n % 12]}{n // 12 - 1}"


def parse_midi(path: Path):
    """-> (seconds_per_beat, [{beat, dur, note, is_drum}...])"""
    mid = mido.MidiFile(path)
    tempo = 500000  # default 120 bpm
    events = []
    for track in mid.tracks:
        t_ticks = 0
        pending = {}  # (channel, note) -> start_ticks
        for msg in track:
            t_ticks += msg.time
            if msg.type == "set_tempo":
                tempo = msg.tempo
            elif msg.type == "note_on" and msg.velocity > 0:
                pending[(msg.channel, msg.note)] = t_ticks
            elif msg.type in ("note_off", "note_on"):
                start = pending.pop((msg.channel, msg.note), None)
                if start is not None:
                    events.append({
                        "beat": start / mid.ticks_per_beat,
                        "dur": (t_ticks - start) / mid.ticks_per_beat,
                        "note": msg.note,
                        "is_drum": msg.channel == 9,
                    })
    return tempo / 1e6, sorted(events, key=lambda e: e["beat"])


def to_step_grid(events):
    """Quantize to a 16th grid; -> {voice_name: {bar: [cell,...]}} plus n_bars."""
    grids = defaultdict(lambda: defaultdict(lambda: ["~"] * STEPS_PER_BAR))
    n_bars = 1
    for e in events:
        step_f = e["beat"] * (STEPS_PER_BAR / 4)  # 4 beats per bar
        step = int(round(step_f))
        bar, pos = divmod(step, STEPS_PER_BAR)
        n_bars = max(n_bars, bar + 1)
        if e["is_drum"]:
            voice = "drums"
            cell = GM_DRUMS.get(e["note"], "perc")
        else:
            voice = "pitched"
            cell = midi_note_name(e["note"])
        prev = grids[voice][bar][pos]
        grids[voice][bar][pos] = cell if prev == "~" else f"{prev},{cell}"
    return grids, n_bars


def describe(grids, n_bars, spb):
    """Render the grids as compact text for the prompt, folding repeated bars."""
    lines = [f"Tempo: {60 / spb:.0f} bpm; {n_bars} bar(s) of 4/4, 16 steps per bar."]
    for voice, bars in grids.items():
        lines.append(f"\nVoice '{voice}' (steps are 16th notes, '~' = rest):")
        seen = {}
        for b in range(n_bars):
            row = " ".join(bars[b][s] for s in range(STEPS_PER_BAR))
            if row in seen:
                lines.append(f"  bar {b + 1}: (same as bar {seen[row]})")
            else:
                seen[row] = b + 1
                lines.append(f"  bar {b + 1}: {row}")
    return "\n".join(lines)


SYSTEM = """You convert transcribed MIDI (as a step grid) into Strudel REPL code.

Strudel essentials:
- stack(a, b, ...) layers voices; one cycle = one bar by default.
- Mini-notation: note("c2 eb2 g1 ~") for pitched, s("bd ~ hh cp") for drums;
  "~" is a rest. 16 tokens = 16th-note grid. Prefer coarser grids when steps
  are empty: "bd*2" repeats, "[hh hh]" subdivides, "<a b>" alternates per cycle.
- Pitched synth voices: .s("sawtooth") with .lpf(800) is the idiomatic
  electronic sound; add .release(.1) for short bass notes.
- Drums: s(...).bank("RolandTR909") for electronic drum sounds.
- TIMING RULE: one cycle = one bar. A mini-notation string is ONE cycle, no
  matter how many tokens it has — 64 tokens in one string play 4x too fast.
  If bars differ, either alternate bars with <[bar1] [bar2]> or concatenate
  them and append .slow(n_bars).
- Every bar must keep its exact step count (16 tokens on a 16th grid) unless
  you simplify losslessly (e.g. "hh ~ ~ ~" x4 -> "hh*4" over the bar).

Rules:
- Reproduce the RHYTHM and PITCHES faithfully; simplify notation when possible.
- Output ONLY one JavaScript code block, no explanation."""


def build_prompt(summary: str) -> str:
    return (
        "Transcribed MIDI content:\n\n" + summary +
        "\n\nWrite Strudel code that reproduces this. Output only the code block."
    )


def call_llm(prompt: str, system: str = SYSTEM) -> str:
    try:
        import anthropic
        try:
            client = anthropic.Anthropic()
            resp = client.messages.create(
                model=MODEL,
                max_tokens=2000,
                system=system,
                messages=[{"role": "user", "content": prompt}],
            )
            return "".join(b.text for b in resp.content if b.type == "text")
        except (anthropic.AuthenticationError, TypeError):
            # no API credentials (TypeError = SDK found no auth source at all)
            pass  # -> CLI fallback below
    except ImportError:
        pass
    # Fallback: Claude Code headless mode (uses the local login, same model)
    r = subprocess.run(
        ["claude", "-p", "--model", MODEL, f"{system}\n\n{prompt}"],
        capture_output=True, text=True, timeout=300,
    )
    if r.returncode != 0:
        raise RuntimeError(f"claude CLI failed: {r.stderr[-500:]}")
    return r.stdout


def extract_code(text: str) -> str:
    m = re.search(r"```(?:javascript|js)?\s*\n(.*?)```", text, re.DOTALL)
    return (m.group(1) if m else text).strip()


def validate(code: str, expected_per_cycle: float | None = None):
    """Evaluate with the real Strudel engine; -> (ok, event_count_or_error).

    Besides "does it compile", check the event *density*: a pattern that
    compiles but plays n_bars too fast (missing .slow) produces ~n_bars times
    the expected events per cycle.
    """
    script = """
const { evalScope } = await import('@strudel/core');
await evalScope(import('@strudel/core'), import('@strudel/mini'));
const { evaluate } = await import('@strudel/transpiler');
const { pattern } = await evaluate(process.argv[1]);
const haps = pattern.queryArc(0, 4).filter(h => h.hasOnset());
console.log(JSON.stringify({ events: haps.length }));
"""
    r = subprocess.run(
        ["node", "--input-type=module", "-e", script, code],
        capture_output=True, text=True, cwd=REPO / "data_gen", timeout=60,
    )
    if r.returncode != 0:
        return False, r.stderr.strip()[-500:]
    events = json.loads(r.stdout.splitlines()[-1])["events"]
    if expected_per_cycle is not None and expected_per_cycle > 0:
        per_cycle = events / 4
        ratio = per_cycle / expected_per_cycle
        if not 0.6 <= ratio <= 1.5:
            return False, (
                f"the pattern produces {per_cycle:.0f} events per cycle but the "
                f"MIDI has ~{expected_per_cycle:.0f} per bar — timing is off by "
                f"~{ratio:.1f}x. Remember: one mini-notation string is ONE "
                f"cycle; multi-bar strings need .slow(n_bars)."
            )
    return True, events


def midi_to_strudel(midi_path: Path, verbose: bool = True):
    spb, events = parse_midi(midi_path)
    if not events:
        raise ValueError(f"no note events in {midi_path}")
    grids, n_bars = to_step_grid(events)
    summary = describe(grids, n_bars, spb)
    if verbose:
        print(summary, "\n")

    expected_per_cycle = len(events) / n_bars
    prompt = build_prompt(summary)
    for attempt in range(3):
        code = extract_code(call_llm(prompt))
        ok, result = validate(code, expected_per_cycle)
        if ok:
            if verbose:
                print(f"valid Strudel ({result} events over 4 cycles)")
            return code
        if verbose:
            print(f"attempt {attempt + 1} failed validation: {result}")
        prompt = (
            build_prompt(summary)
            + f"\n\nYour previous attempt:\n```js\n{code}\n```\n"
            + f"was rejected: {result}\nFix it."
        )
    raise RuntimeError("LLM output failed Strudel validation 3 times")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("midi", type=Path)
    ap.add_argument("-o", "--out", type=Path, default=None)
    args = ap.parse_args()

    code = midi_to_strudel(args.midi)
    print("\n" + code)
    if args.out:
        args.out.write_text(code + "\n")
        print(f"\nwritten: {args.out}")
