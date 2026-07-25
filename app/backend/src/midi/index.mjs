// midi/index.mjs — canonical note events -> a .mid buffer (roadmap A7a).
//
// Written specifically for MIDI-To-Strudel, whose behaviour constrains the
// layout (verified against its source, Emanuel-de-Jong/MIDI-To-Strudel):
//
//   * tempo is read from `mid.tracks[0]` ONLY  -> the tempo must live in the
//     first track, which is why we emit a dedicated conductor track;
//   * voices are keyed by (track index, channel) -> one track per instrument
//     group gives one `$:` voice per instrument;
//   * `--guess-instrument` maps a `program_change` to a Strudel sound -> every
//     track emits one;
//   * it has NO drum handling: channel-9 notes are rendered as melodic notes
//     (pitch 36 -> "c2"). We therefore keep drums in their own track and
//     return a `voices` map so a later stage knows which emitted voice is a
//     drum part and can rewrite it into `s("bd sd hh")` notation.
//
// The MIDI is written by hand rather than via a library: the byte format is
// small and fully specified here, and it lets us guarantee the constraints
// above (notably tempo-in-track-0) instead of hoping a library preserves them.

const TICKS_PER_BEAT = 480;
const DRUM_CHANNEL = 9;
// GM 118 "Synth Drum" — the closest thing to a percussion voice in a melodic
// program map, so `--guess-instrument` picks a drum-ish sound for that track.
const DRUM_PROGRAM = 118;
const DEFAULT_PROGRAM = 80; // GM 81 Lead 1 (square): our domain is synth music.

function writeVarLen(value) {
  const bytes = [value & 0x7f];
  let v = value >> 7;
  while (v > 0) {
    bytes.unshift((v & 0x7f) | 0x80);
    v >>= 7;
  }
  return bytes;
}

function chunk(id, data) {
  const header = Buffer.alloc(8);
  header.write(id, 0, 'ascii');
  header.writeUInt32BE(data.length, 4);
  return Buffer.concat([header, Buffer.from(data)]);
}

/** Group events into the tracks MIDI-To-Strudel will turn into `$:` voices. */
export function groupVoices(events) {
  const groups = new Map();
  for (const e of events) {
    // Drums are one voice; pitched events split by GM program so a bass and a
    // lead do not collapse into a single line the LLM has to un-mix.
    const key = e.channel === 'drums'
      ? 'drums'
      : `program:${Number.isFinite(e.program) ? e.program : DEFAULT_PROGRAM}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }

  return [...groups.entries()].map(([key, groupEvents], index) => {
    const isDrums = key === 'drums';
    return {
      // Track 0 is the conductor track, so musical tracks start at 1 — this
      // index is what MIDI-To-Strudel uses as part of its voice key.
      trackIndex: index + 1,
      isDrums,
      channel: isDrums ? DRUM_CHANNEL : Math.min(index, 8),
      program: isDrums ? DRUM_PROGRAM : Number.parseInt(key.slice('program:'.length), 10),
      events: groupEvents.slice().sort((a, b) => a.onset - b.onset || a.pitch - b.pitch),
    };
  });
}

/**
 * Build a type-1 MIDI file from canonical note events.
 *
 * @param {Array} events canonical NoteEvents (onset/duration/pitch/velocity/channel[/program])
 * @param {{tempoBpm?: number|null}} [opts]
 * @returns {{buffer: Buffer, tempoBpm: number, voices: Array}}
 */
export function eventsToMidi(events, { tempoBpm } = {}) {
  const bpm = Number.isFinite(tempoBpm) && tempoBpm > 0 ? tempoBpm : 120;
  const voices = groupVoices(events ?? []);
  const secondsPerTick = 60 / bpm / TICKS_PER_BEAT;

  // Track 0: tempo only. MIDI-To-Strudel scans exactly this track for it.
  const microsPerBeat = Math.round(60_000_000 / bpm);
  const conductor = [
    ...writeVarLen(0), 0xff, 0x51, 0x03,
    (microsPerBeat >> 16) & 0xff, (microsPerBeat >> 8) & 0xff, microsPerBeat & 0xff,
    ...writeVarLen(0), 0xff, 0x2f, 0x00, // end of track
  ];

  const trackChunks = [chunk('MTrk', conductor)];

  for (const voice of voices) {
    // Absolute-time events first, then delta-encode — note offs interleave
    // with later note ons, so they cannot be emitted note-by-note.
    const timed = [];
    for (const e of voice.events) {
      const onTick = Math.max(0, Math.round(e.onset / secondsPerTick));
      const offTick = Math.max(onTick + 1, Math.round((e.onset + e.duration) / secondsPerTick));
      const pitch = Math.max(0, Math.min(127, Math.round(e.pitch)));
      const velocity = Math.max(1, Math.min(127, Math.round(e.velocity ?? 96)));
      timed.push({ tick: onTick, order: 1, bytes: [0x90 | voice.channel, pitch, velocity] });
      timed.push({ tick: offTick, order: 0, bytes: [0x80 | voice.channel, pitch, 0] });
    }
    // Note-offs before note-ons at the same tick, so a repeated pitch retriggers.
    timed.sort((a, b) => a.tick - b.tick || a.order - b.order);

    const data = [
      // program_change at t=0: what --guess-instrument reads.
      ...writeVarLen(0), 0xc0 | voice.channel, voice.program & 0x7f,
    ];
    let prevTick = 0;
    for (const ev of timed) {
      data.push(...writeVarLen(ev.tick - prevTick), ...ev.bytes);
      prevTick = ev.tick;
    }
    data.push(...writeVarLen(0), 0xff, 0x2f, 0x00);
    trackChunks.push(chunk('MTrk', data));
  }

  const header = Buffer.alloc(6);
  header.writeUInt16BE(1, 0); // format 1: one conductor track + N music tracks
  header.writeUInt16BE(trackChunks.length, 2);
  header.writeUInt16BE(TICKS_PER_BEAT, 4);

  return {
    buffer: Buffer.concat([chunk('MThd', header), ...trackChunks]),
    tempoBpm: bpm,
    // Describes what each emitted voice is, in the order MIDI-To-Strudel will
    // emit them — the polish stage uses this to fix up the drum voice.
    voices: voices.map((v) => ({
      trackIndex: v.trackIndex,
      channel: v.channel,
      program: v.program,
      isDrums: v.isDrums,
      noteCount: v.events.length,
    })),
  };
}
