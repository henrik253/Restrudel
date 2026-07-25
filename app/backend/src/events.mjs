// events.mjs — the canonical note-event schema every transcriber adapter
// normalizes into, and what the LLM stage consumes. Resolves the field-name
// mismatch between data_gen/extract_labels.mjs ({t,dur,pitch,s,...}) and the
// MIDI-side tooling ({beat,dur,note,is_drum}).
//
/**
 * @typedef {Object} NoteEvent
 * @property {number} onset     seconds from snippet start
 * @property {number} duration  seconds
 * @property {number} pitch     MIDI note number (GM drum number for drums)
 * @property {number} velocity  1-127
 * @property {'drums'|'pitched'} channel
 * @property {number} [program] GM program (0-127), when the transcriber knows it.
 *                              Optional: the mock and MIDI-parsing adapters omit
 *                              it. Carried through so codegen can split voices by
 *                              instrument rather than lumping all pitched notes.
 *
 * @typedef {Object} TranscriptionResult
 * @property {NoteEvent[]} events
 * @property {number|null} tempoBpm
 * @property {{adapter: string, [k: string]: any}} meta
 */

/** Normalize a parsed `@tonejs/midi` Midi object -> {events, tempoBpm}. */
export function fromToneMidi(midi) {
  const events = [];
  for (const track of midi.tracks) {
    const isDrums = track.channel === 9 || track.instrument?.percussion === true;
    for (const n of track.notes) {
      events.push({
        onset: n.time,
        duration: Math.max(n.duration, 0.01),
        pitch: n.midi,
        velocity: Math.max(1, Math.min(127, Math.round((n.velocity ?? 0.75) * 127))),
        channel: isDrums ? 'drums' : 'pitched',
      });
    }
  }
  events.sort((a, b) => a.onset - b.onset || a.pitch - b.pitch);
  const tempoBpm = midi.header?.tempos?.[0]?.bpm ?? null;
  return { events, tempoBpm: tempoBpm ? Math.round(tempoBpm) : null };
}

/** Drop malformed events; clamp fields into range. */
export function sanitizeEvents(events) {
  return (events ?? [])
    .filter((e) => Number.isFinite(e.onset) && Number.isFinite(e.pitch) && e.onset >= 0)
    .map((e) => {
      const out = {
        onset: e.onset,
        duration: Number.isFinite(e.duration) && e.duration > 0 ? e.duration : 0.1,
        pitch: Math.round(e.pitch),
        velocity: Math.max(1, Math.min(127, Math.round(e.velocity ?? 96))),
        channel: e.channel === 'drums' ? 'drums' : 'pitched',
      };
      if (Number.isFinite(e.program)) {
        out.program = Math.max(0, Math.min(127, Math.round(e.program)));
      }
      return out;
    });
}
