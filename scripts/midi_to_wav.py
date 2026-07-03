#!/usr/bin/env python3
"""Render a MIDI file to an audible WAV — no external synth or soundfont.

There is no fluidsynth/timidity/soundfont on the target machine, and a
transcription preview doesn't need General-MIDI realism — it needs to be
*listenable* so you can hear what YourMT3+ actually produced. So this is a
tiny built-in synth: pitched notes become a few summed sine harmonics with a
plucked envelope; drum-channel (ch 9) notes become decaying noise bursts
voiced by their GM percussion number (kick = low thump, snare/clap = mid
noise, hats = short bright noise).

Usage: .venv/bin/python scripts/midi_to_wav.py input.mid [-o out.wav]
       from midi_to_wav import render_midi_to_wav
"""
import argparse
import struct
from pathlib import Path

import mido
import numpy as np

SR = 44100
TAIL = 0.5  # seconds of silence after the last note-off


def _adsr(n: int, attack=0.005, release=0.06) -> np.ndarray:
    """Pluck envelope: quick attack, exponential body, short release."""
    env = np.ones(n)
    a = min(int(attack * SR), n)
    r = min(int(release * SR), n)
    if a:
        env[:a] = np.linspace(0, 1, a)
    body = np.exp(-np.linspace(0, 3, n))  # gentle decay across the note
    env *= body
    if r:
        env[-r:] *= np.linspace(1, 0, r)
    return env


def _pitched(freq: float, dur: float, amp: float) -> np.ndarray:
    n = int(dur * SR)
    if n <= 0:
        return np.zeros(0)
    t = np.arange(n) / SR
    wave = np.zeros(n)
    for k, gain in enumerate((1.0, 0.5, 0.25), start=1):  # first 3 harmonics
        wave += gain * np.sin(2 * np.pi * freq * k * t)
    return amp * wave / 1.75 * _adsr(n)


# GM percussion note -> (decay seconds, optional body-sine Hz)
_DRUM_VOICE = {
    35: (0.28, 55), 36: (0.28, 60),          # kick
    38: (0.20, None), 40: (0.20, None),       # snare
    39: (0.22, None),                          # clap
    42: (0.05, None), 44: (0.06, None),        # closed / pedal hat
    46: (0.30, None),                          # open hat
    49: (0.45, None), 57: (0.45, None), 51: (0.40, None),  # cymbals
}


def _drum(note: int, amp: float) -> np.ndarray:
    decay, body_hz = _DRUM_VOICE.get(note, (0.15, None))
    n = int(decay * SR)
    t = np.arange(n) / SR
    env = np.exp(-t / (decay / 4))
    sig = np.random.default_rng(note).uniform(-1, 1, n) * env
    if body_hz:  # kick gets a pitched thump under the noise
        sig = 0.4 * sig + np.sin(2 * np.pi * body_hz * t) * env
    return amp * sig


def _notes(path: Path):
    """Yield (start_s, dur_s, note, is_drum, velocity)."""
    mid = mido.MidiFile(path)
    tempo = 500000
    for track in mid.tracks:
        t_ticks = 0
        pending = {}
        for msg in track:
            t_ticks += msg.time
            if msg.type == "set_tempo":
                tempo = msg.tempo
            elif msg.type == "note_on" and msg.velocity > 0:
                pending[(msg.channel, msg.note)] = (t_ticks, msg.velocity)
            elif msg.type in ("note_off", "note_on"):
                start = pending.pop((msg.channel, msg.note), None)
                if start is not None:
                    start_ticks, vel = start
                    spt = tempo / 1e6 / mid.ticks_per_beat
                    yield (start_ticks * spt, max(t_ticks - start_ticks, 1) * spt,
                           msg.note, msg.channel == 9, vel)


def render_midi_to_wav(midi_path: Path, wav_path: Path) -> Path:
    midi_path, wav_path = Path(midi_path), Path(wav_path)
    notes = list(_notes(midi_path))
    total = max((s + d for s, d, *_ in notes), default=1.0) + TAIL
    buf = np.zeros(int(total * SR) + SR)
    for start, dur, note, is_drum, vel in notes:
        amp = 0.3 * (vel / 127)
        seg = _drum(note, amp) if is_drum else _pitched(
            440 * 2 ** ((note - 69) / 12), min(dur, 1.5) + 0.1, amp)
        i = int(start * SR)
        buf[i:i + len(seg)] += seg

    peak = np.max(np.abs(buf)) or 1.0
    pcm = (buf / peak * 0.9 * 32767).astype("<i2")
    data = pcm.tobytes()
    with open(wav_path, "wb") as f:
        f.write(b"RIFF")
        f.write(struct.pack("<I", 36 + len(data)))
        f.write(b"WAVEfmt ")
        f.write(struct.pack("<IHHIIHH", 16, 1, 1, SR, SR * 2, 2, 16))
        f.write(b"data")
        f.write(struct.pack("<I", len(data)))
        f.write(data)
    return wav_path


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("midi", type=Path)
    ap.add_argument("-o", "--out", type=Path, default=None)
    args = ap.parse_args()
    out = args.out or args.midi.with_suffix(".wav")
    render_midi_to_wav(args.midi, out)
    print(f"wrote {out}")
