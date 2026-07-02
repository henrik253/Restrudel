#!/usr/bin/env node
/**
 * generate.mjs — synthesize Strudel code by sampling the corpus distributions.
 *
 * Algorithm (roadmap Phase 4, stage 3): Strudel is chained function calls, so
 * each voice is built step by step:
 *   1. sample the HEAD function from P(head)            (transitions.heads)
 *   2. sample its CONTENT from P(content | function)    (arguments.json)
 *   3. sample the NEXT function from P(next | current)  (transitions.depth1),
 *      where __END__ stops the chain; repeat 2–3.
 * Voices per song come from the corpus polyphony stats  (complexity.json).
 *
 * Usage:  node generate.mjs [--n 5] [--seed 42] [--out dir/]
 * Writes {seed}_{i}.js files to --out, or prints to stdout.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RESULTS = join(dirname(fileURLToPath(import.meta.url)), '..', 'analysis', 'results');
const load = (name) => JSON.parse(readFileSync(join(RESULTS, `${name}.json`), 'utf8'));
const transitions = load('transitions');
const argStats = load('arguments').functions;
const complexity = load('complexity');

// ---------- seeded RNG (mulberry32) ----------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const weightedPick = (rng, items, weightOf) => {
  const total = items.reduce((s, it) => s + weightOf(it), 0);
  let r = rng() * total;
  for (const it of items) { r -= weightOf(it); if (r <= 0) return it; }
  return items[items.length - 1];
};

// ---------- what the sampler is allowed to emit -----------------------------
// Heads restricted to sound sources (chain heads in the corpus also include JS
// noise like `if`/`register` that would not evaluate standalone).
const HEADS = new Set(['note', 'n', 's', 'sound', 'freq']);
// Chainable methods must (a) appear in transitions, (b) have sampleable content.
// Functions whose corpus args are mostly code (arrow fns, nested patterns like
// every/off/sometimesBy) are excluded until the generator can emit those forms.
const CHAINABLE = new Set([
  's', 'sound', 'note', 'n', 'gain', 'velocity', 'pan', 'lpf', 'hpf', 'cutoff',
  'resonance', 'lpq', 'room', 'roomsize', 'size', 'delay', 'delaytime',
  'delayfeedback', 'shape', 'distort', 'crush', 'coarse', 'vowel', 'speed',
  'attack', 'decay', 'sustain', 'release', 'adsr', 'clip', 'legato',
  'fast', 'slow', 'rev', 'palindrome', 'iter', 'ply', 'segment', 'struct',
  'euclid', 'scale', 'transpose', 'add', 'bank', 'fm', 'fmh', 'vib', 'vibmod',
  'phaser', 'orbit', 'late', 'early', 'swingBy', 'degradeBy',
]);

const fmtNum = (v) => Number.isInteger(v) ? String(v) : String(+v.toFixed(4)).replace(/^0\./, '.');

// ---------- content: P(content | function) ----------------------------------
function sampleContent(rng, fn) {
  const st = argStats[fn];
  if (!st) return null;
  const pNum = st.p_numeric ?? 0, pStr = st.p_string ?? 0;
  if (pNum + pStr < 0.5) return null;            // args are mostly code → skip fn
  const useNum = st.numeric && (!st.strings || rng() * (pNum + pStr) < pNum);
  if (useNum) {
    // 70%: an observed common value; 30%: interpolate between quantiles for variety
    if (st.numeric.common?.length && rng() < 0.7) {
      return fmtNum(weightedPick(rng, st.numeric.common, (c) => c.prob).value);
    }
    const q = st.numeric.quantiles;              // [q05,q25,q50,q75,q95]
    const i = Math.min(3, Math.floor(rng() * 4));
    const v = q[i] + rng() * (q[i + 1] - q[i]);
    // keep integer-valued params integer (lpf(2000), not lpf(2000.37))
    const allInt = st.numeric.common?.every((c) => Number.isInteger(c.value));
    return fmtNum(allInt ? Math.round(v) : v);
  }
  if (st.strings?.length) {
    const s = weightedPick(rng, st.strings, (x) => x.prob).value;
    return JSON.stringify(s);
  }
  return null;
}

// ---------- chain: head → next → … → __END__ --------------------------------
// A chain may assign each kind of source only once (no `.sound(..)..sound(..)`).
const SAMPLE_ASSIGN = new Set(['s', 'sound']);
const PITCH_ASSIGN = new Set(['note', 'n', 'freq']);

function sampleChain(rng, { maxLen = 8 } = {}) {
  const heads = transitions.heads.items.filter((h) => HEADS.has(h.name));
  const chain = [];
  const used = new Set();
  let cur = weightedPick(rng, heads, (h) => h.prob).name;
  while (chain.length < maxLen) {
    const content = sampleContent(rng, cur);
    if (content !== null) {
      chain.push({ fn: cur, content });
      if (SAMPLE_ASSIGN.has(cur)) used.add('sample-assign');
      if (PITCH_ASSIGN.has(cur)) used.add('pitch-assign');
      used.add(cur);
    }
    const entry = transitions.depth1[cur];
    if (!entry) break;
    // resample among allowed successors (or END); drop code-arg functions,
    // already-used functions, and second source assignments
    const opts = entry.successors.filter((s) =>
      s.name === '__END__' ||
      (CHAINABLE.has(s.name) && argStats[s.name] && !used.has(s.name) &&
       !(SAMPLE_ASSIGN.has(s.name) && used.has('sample-assign')) &&
       !(PITCH_ASSIGN.has(s.name) && used.has('pitch-assign'))));
    if (!opts.length) break;
    const next = weightedPick(rng, opts, (s) => s.prob).name;
    if (next === '__END__') break;
    cur = next;
  }
  return chain;
}

// ---------- song: voices from complexity ------------------------------------
function sampleVoices(rng) {
  // empirical quartiles of $:/stack voice counts; clamp to a sane range
  const { '25%': q1, '50%': q2, '75%': q3 } = complexity.voices;
  const r = rng();
  const v = r < 0.25 ? q1 : r < 0.5 ? q2 : r < 0.75 ? q3 : q3 + 1;
  return Math.max(1, Math.min(5, Math.round(v)));
}

export function generateSong(seed) {
  const rng = mulberry32(seed);
  const lines = [];
  const voices = sampleVoices(rng);
  for (let v = 0; v < voices; v++) {
    let chain = sampleChain(rng);
    for (let tries = 0; !chain.length && tries < 5; tries++) chain = sampleChain(rng);
    if (!chain.length) continue;
    lines.push('$: ' + chain.map(({ fn, content }) => `${fn}(${content})`).join('.'));
  }
  return { code: lines.join('\n\n') + '\n', voices: lines.length, seed };
}

// ---------- CLI --------------------------------------------------------------
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (name, dflt) => {
    const i = process.argv.indexOf(`--${name}`);
    return i > -1 ? process.argv[i + 1] : dflt;
  };
  const n = parseInt(arg('n', '5'), 10);
  const seed = parseInt(arg('seed', '42'), 10);
  const out = arg('out', null);

  if (out) mkdirSync(out, { recursive: true });
  for (let i = 0; i < n; i++) {
    const song = generateSong(seed + i);
    const header = `// synthetic strudel pattern — seed ${song.seed}, ${song.voices} voice(s)\n// generator: data_gen/generate.mjs (sampled from analysis/results/)\n\n`;
    if (out) writeFileSync(join(out, `${seed}_${i}.js`), header + song.code);
    else console.log(`${'='.repeat(60)}\n${header}${song.code}`);
  }
  if (out) console.log(`wrote ${n} songs to ${out}`);
}
