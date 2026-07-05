// extract_labels.mjs — Strudel pattern string -> ground-truth note events (JSON).
//
// This is the "Labels (Part A)" half of the data pipeline: evaluate the code,
// queryArc over N cycles, and emit every onset as a timed event in SECONDS,
// using the same evaluation + tempo logic as render_offline.mjs (via
// strudel_eval.mjs) so labels and audio are aligned by construction.
//
// No audio, no browser, deterministic. The Python side (scripts/dataset/)
// maps events to MIDI programs / GM drums and the YourMT3 formats.
//
// Usage:
//   node extract_labels.mjs --file song.js [--cycles 8] [--out labels.json]
//   node extract_labels.mjs --code 'note("c2 e2").s("sawtooth")' --cycles 4
//
// Output JSON:
//   { cps, cpsSource, cycles, duration_s, n_events, events: [
//       { t, dur, kind: "pitched"|"drum"|"sample", pitch?, s?, bank?, n?, gain? } ] }
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { evalStrudel } from './strudel_eval.mjs';
import { noteToMidi } from '@strudel/core';

const { values: args } = parseArgs({
  options: {
    code: { type: 'string' },
    file: { type: 'string' },
    out: { type: 'string' },
    cycles: { type: 'string', default: '8' },
    cps: { type: 'string' }, // override the song/default tempo
  },
});

// Drum sample names as used across the corpus (tidal-drum-machines / dirt-samples).
const DRUMS = new Set([
  'bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb', 'cr', 'rd', 'lt', 'mt', 'ht',
  'tb', 'sh', 'perc', 'click', 'clap',
]);

function toMidiPitch(value) {
  if (value.note !== undefined) {
    if (typeof value.note === 'number') return Math.round(value.note);
    const m = noteToMidi(value.note);
    if (m !== undefined) return m;
  }
  if (value.freq !== undefined && value.freq > 0) {
    return Math.round(69 + 12 * Math.log2(value.freq / 440));
  }
  return null;
}

const code = args.code ?? readFileSync(args.file, 'utf8');
const cycles = Number(args.cycles);

const { pattern, cps: songCps, cpsSource, voices } = await evalStrudel(code);
const cps = args.cps !== undefined ? Number(args.cps) : songCps;

const events = [];
for (const hap of pattern.queryArc(0, cycles)) {
  if (!hap.hasOnset()) continue;
  const v = hap.value ?? {};
  if (typeof v !== 'object') continue; // bare numbers/strings: nothing to voice
  const t = hap.whole.begin.valueOf() / cps;
  const dur = hap.duration.valueOf() / cps;
  const pitch = toMidiPitch(v);
  const s = v.s ?? v.sound;
  const kind = s !== undefined && DRUMS.has(String(s).toLowerCase().replace(/:\d+$/, ''))
    ? 'drum'
    : pitch !== null
      ? 'pitched'
      : 'sample'; // unpitched non-drum sample (n-indexed breaks etc.)
  const ev = { t: +t.toFixed(6), dur: +dur.toFixed(6), kind };
  if (pitch !== null) ev.pitch = pitch;
  if (s !== undefined) ev.s = String(s);
  if (v.bank !== undefined) ev.bank = String(v.bank);
  if (v.n !== undefined) ev.n = v.n;
  if (v.gain !== undefined) ev.gain = v.gain;
  events.push(ev);
}
events.sort((a, b) => a.t - b.t || (a.pitch ?? 0) - (b.pitch ?? 0));

const result = {
  cps,
  cpsSource: args.cps !== undefined ? 'cli' : cpsSource,
  cycles,
  voices,
  duration_s: +(cycles / cps).toFixed(6),
  n_events: events.length,
  events,
};

const json = JSON.stringify(result, null, 1);
if (args.out) {
  writeFileSync(args.out, json);
  console.error(`wrote ${args.out}: ${events.length} events, ${result.duration_s}s @ cps=${cps} (${result.cpsSource})`);
} else {
  console.log(json);
}
