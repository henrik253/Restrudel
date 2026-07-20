import assert from 'node:assert/strict';
import { test } from 'node:test';
import { describeGrids, midiNoteName, toStepGrid } from '../src/llm/describe.mjs';

const drum = (onset, pitch) => ({ onset, duration: 0.1, pitch, velocity: 100, channel: 'drums' });
const note = (onset, pitch) => ({ onset, duration: 0.4, pitch, velocity: 96, channel: 'pitched' });

test('midiNoteName maps MIDI numbers like the python port', () => {
  assert.equal(midiNoteName(36), 'c2');
  assert.equal(midiNoteName(33), 'a1');
  assert.equal(midiNoteName(61), 'cs4');
  assert.equal(midiNoteName(63), 'eb4');
});

test('quantizes onsets to the 16th grid at 120 bpm', () => {
  // 120 bpm: 1 beat = 0.5 s, 1 step = 0.125 s
  const { grids, nBars } = toStepGrid([drum(0, 36), drum(0.5, 36), drum(1.0, 36), drum(1.5, 36)], 120);
  assert.equal(nBars, 1);
  const row = grids.get('drums').get(0);
  assert.equal(row.join(' '), 'bd ~ ~ ~ bd ~ ~ ~ bd ~ ~ ~ bd ~ ~ ~');
});

test('off-grid onsets round to the nearest step', () => {
  const { grids } = toStepGrid([drum(0.13, 38)], 120); // 0.13 s = step 1.04 -> step 1
  assert.equal(grids.get('drums').get(0)[1], 'sd');
});

test('simultaneous events stack with a comma', () => {
  const { grids } = toStepGrid([drum(0, 36), drum(0, 38)], 120);
  assert.equal(grids.get('drums').get(0)[0], 'bd,sd');
});

test('unknown drum pitches fall back to perc; pitched voices use note names', () => {
  const { grids } = toStepGrid([drum(0, 81), note(0, 33)], 120);
  assert.equal(grids.get('drums').get(0)[0], 'perc');
  assert.equal(grids.get('pitched').get(0)[0], 'a1');
});

test('describeGrids folds repeated bars', () => {
  const events = [];
  for (const bar of [0, 1]) for (let beat = 0; beat < 4; beat++) events.push(drum(bar * 2 + beat * 0.5, 36));
  const { grids, nBars } = toStepGrid(events, 120);
  const text = describeGrids(grids, nBars, 120);
  assert.match(text, /Tempo: 120 bpm; 2 bar\(s\)/);
  assert.match(text, /bar 1: bd ~ ~ ~ bd ~ ~ ~ bd ~ ~ ~ bd ~ ~ ~/);
  assert.match(text, /bar 2: \(same as bar 1\)/);
});

test('a second bar with different content is written out', () => {
  const events = [drum(0, 36), drum(2.0, 38)]; // bar 1: bd, bar 2: sd
  const { grids, nBars } = toStepGrid(events, 120);
  const text = describeGrids(grids, nBars, 120);
  assert.equal(nBars, 2);
  assert.match(text, /bar 2: sd/);
});
