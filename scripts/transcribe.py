"""Stage 2: transcribe a separated stem (wav) to MIDI with Basic Pitch.

Defaults are tuned for bass stems; override per-stem via CLI flags.

Usage:
    python scripts/transcribe.py separated/htdemucs/<track>/bass.wav [-o out.mid]
"""

import argparse
from datetime import datetime
from pathlib import Path

from basic_pitch.inference import predict


def transcribe(
    audio_path: Path,
    out_path: Path,
    onset_threshold: float,
    frame_threshold: float,
    minimum_note_length: float,
    minimum_frequency: float,
    maximum_frequency: float,
) -> None:
    model_output, midi_data, note_events = predict(
        str(audio_path),
        onset_threshold=onset_threshold,
        frame_threshold=frame_threshold,
        minimum_note_length=minimum_note_length,
        minimum_frequency=minimum_frequency,
        maximum_frequency=maximum_frequency,
        melodia_trick=True,
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    midi_data.write(str(out_path))
    print(f"{len(note_events)} notes -> {out_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("audio", type=Path, help="input stem wav")
    parser.add_argument(
        "-o",
        "--out",
        type=Path,
        default=None,
        help="output .mid path (default: midi_out/<stem-name>.mid)",
    )
    # higher than Basic Pitch defaults (0.5/0.3) to suppress ghost notes
    parser.add_argument("--onset-threshold", type=float, default=0.6)
    parser.add_argument("--frame-threshold", type=float, default=0.4)
    # ms; kills transcription stutter
    parser.add_argument("--min-note-length", type=float, default=120)
    # Hz; bass low E1 is ~41 Hz
    parser.add_argument("--min-freq", type=float, default=30)
    # Hz; anything above is a harmonic, not a bass note
    parser.add_argument("--max-freq", type=float, default=400)
    args = parser.parse_args()

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    out = args.out or Path("midi_out") / f"{args.audio.stem}_{timestamp}.mid"
    transcribe(
        args.audio,
        out,
        onset_threshold=args.onset_threshold,
        frame_threshold=args.frame_threshold,
        minimum_note_length=args.min_note_length,
        minimum_frequency=args.min_freq,
        maximum_frequency=args.max_freq,
    )


if __name__ == "__main__":
    main()
