// midi.test.mjs — events -> .mid, checked by parsing the bytes back.
//
// The invariants here are not cosmetic: each one is a MIDI-To-Strudel
// requirement found by reading its source (see src/midi/index.mjs). Breaking
// one produces silently wrong Strudel code rather than an error.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import toneMidi from '@tonejs/midi';

import { eventsToMidi, groupVoices } from '../src/midi/index.mjs';

const { Midi } = toneMidi;

const note = (onset, pitch, over = {}) => ({
  onset, duration: 0.25, pitch, velocity: 96, channel: 'pitched', ...over,
});
const drum = (onset, pitch) => note(onset, pitch, { channel: 'drums', duration: 0.05 });

describe('events -> MIDI', () => {
  it('puts the tempo in track 0, where MIDI-To-Strudel looks for it', () => {
    const { buffer } = eventsToMidi([note(0, 60)], { tempoBpm: 117.19 });
    const parsed = new Midi(buffer);
    assert.equal(Math.round(parsed.header.tempos[0].bpm), 117);
    assert.equal(parsed.header.tempos[0].ticks, 0);
  });

  it('falls back to 120 BPM when tempo is unknown', () => {
    for (const bad of [null, undefined, 0, -5, NaN]) {
      assert.equal(eventsToMidi([note(0, 60)], { tempoBpm: bad }).tempoBpm, 120);
    }
  });

  it('round-trips onsets, durations and pitches', () => {
    const events = [note(0, 60), note(0.5, 64), note(1.25, 67)];
    const { buffer } = eventsToMidi(events, { tempoBpm: 120 });
    const notes = new Midi(buffer).tracks.flatMap((t) => t.notes);
    assert.equal(notes.length, 3);
    for (const [i, n] of notes.entries()) {
      assert.equal(n.midi, events[i].pitch);
      assert.ok(Math.abs(n.time - events[i].onset) < 0.01, `onset ${n.time}`);
      assert.ok(Math.abs(n.duration - events[i].duration) < 0.01, `duration ${n.duration}`);
    }
  });

  it('splits pitched voices by GM program, so bass and lead stay separate', () => {
    const { voices, buffer } = eventsToMidi([
      note(0, 36, { program: 38 }), // synth bass
      note(0, 72, { program: 80 }), // synth lead
      note(1, 74, { program: 80 }),
    ], { tempoBpm: 120 });

    assert.equal(voices.length, 2);
    assert.deepEqual(voices.map((v) => v.program).sort(), [38, 80]);
    assert.deepEqual(voices.map((v) => v.noteCount).sort(), [1, 2]);
    // Track 0 is the conductor; each voice is its own track.
    assert.equal(new Midi(buffer).tracks.filter((t) => t.notes.length).length, 2);
  });

  it('keeps drums in their own track on channel 9', () => {
    const { voices, buffer } = eventsToMidi([
      note(0, 60, { program: 80 }), drum(0, 36), drum(0.5, 38),
    ], { tempoBpm: 120 });

    const drums = voices.find((v) => v.isDrums);
    assert.ok(drums, 'expected a drum voice');
    assert.equal(drums.channel, 9);
    assert.equal(drums.noteCount, 2);
    // The drum voice is reported so a later stage can rewrite it: the tool
    // itself renders channel-9 notes as melodic notes (verified 2026-07-24).
    assert.equal(voices.filter((v) => !v.isDrums).length, 1);

    const drumTrack = new Midi(buffer).tracks.find((t) => t.channel === 9);
    assert.equal(drumTrack.notes.length, 2);
  });

  it('emits a program_change per voice (what --guess-instrument reads)', () => {
    const { buffer } = eventsToMidi([note(0, 60, { program: 38 })], { tempoBpm: 120 });
    const track = new Midi(buffer).tracks.find((t) => t.notes.length);
    assert.equal(track.instrument.number, 38);
  });

  it('defaults a missing program to a synth lead rather than piano', () => {
    const [voice] = groupVoices([note(0, 60)]);
    assert.equal(voice.program, 80); // GM 81 Lead 1 (square)
  });

  it('retriggers a repeated pitch (note-off precedes the next note-on)', () => {
    const { buffer } = eventsToMidi([
      note(0, 60, { duration: 0.5 }), note(0.5, 60, { duration: 0.5 }),
    ], { tempoBpm: 120 });
    const notes = new Midi(buffer).tracks.flatMap((t) => t.notes);
    assert.equal(notes.length, 2, 'both hits must survive');
    assert.ok(notes[1].time >= notes[0].time + notes[0].duration - 0.01);
  });

  it('produces a parseable file for zero events', () => {
    const { buffer, voices } = eventsToMidi([], { tempoBpm: 128 });
    assert.deepEqual(voices, []);
    const parsed = new Midi(buffer);
    assert.equal(parsed.tracks.flatMap((t) => t.notes).length, 0);
    assert.equal(Math.round(parsed.header.tempos[0].bpm), 128);
  });

  it('clamps out-of-range pitch and velocity instead of writing corrupt bytes', () => {
    const { buffer } = eventsToMidi([
      note(0, 200, { velocity: 999 }), note(0.5, -10, { velocity: 0 }),
    ], { tempoBpm: 120 });
    const notes = new Midi(buffer).tracks.flatMap((t) => t.notes);
    assert.equal(notes.length, 2);
    for (const n of notes) {
      assert.ok(n.midi >= 0 && n.midi <= 127, `pitch ${n.midi}`);
      assert.ok(n.velocity > 0 && n.velocity <= 1, `velocity ${n.velocity}`);
    }
  });

  it('gives every note a non-zero length', () => {
    const { buffer } = eventsToMidi([note(0, 60, { duration: 0.0001 })], { tempoBpm: 120 });
    const [n] = new Midi(buffer).tracks.flatMap((t) => t.notes);
    assert.ok(n.durationTicks >= 1);
  });
});
