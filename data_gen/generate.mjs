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
const contentModels = load('content_models').functions;   // raw sequences per seq fn

// Temperature for content sampling: weight_i = p_i^TEMP (then renormalize).
// TEMP=1 → empirical distribution; TEMP<1 → flatter/more volatile (breaks
// dominant-token alternation); TEMP→0 → uniform. Tunable via --temp.
// --- generation hyperparameters (CLI-overridable) ---------------------------
let TEMP = 0.2;           // content-sampling temperature
let MIN_VOICES = 2;       // voices per song: floor (raise for denser songs)
let MAX_VOICES = 4;       // voices per song: cap
let MIN_LEN = 2;          // tokens per content sequence: floor (>1 kills the
                          //   "single sound that just repeats" songs)
let MAX_LEN = 32;         // tokens per content sequence: cap
const MAX_ORDER = 6;      // longest prefix context to condition on

// --- S1 timbre coverage (Track B B6 / docs/roadmap.md Phase 8 B4) ------------
// The generalization axis is TIMBRE, not symbolic realism. Sampling sounds/FX
// from the corpus frequency reproduces its sawtooth dominance → exactly Slakh's
// narrow-timbre trap. With --timbre-coverage on, timbre-shaping params are drawn
// to SPAN their range (uniform / log-uniform) with 10% pushed to an extreme
// (over-sample rare configs), and synth voices get a uniformly-chosen waveform.
// Notes/rhythm/functions still come from the corpus distribution (realism).
let TIMBRE_COVERAGE = false;
const COVERAGE_WAVEFORMS = ['sawtooth', 'square', 'triangle', 'sine',
  'supersaw', 'pulse', 'fm', 'triangle', 'square'];  // deliberately NOT saw-heavy
const COVERAGE_RANGES = {  // [lo, hi, scale]
  lpf: [100, 8000, 'log'], cutoff: [100, 8000, 'log'], hpf: [20, 2000, 'log'],
  resonance: [0, 25, 'lin'], lpq: [0, 25, 'lin'],
  attack: [0, 0.5, 'lin'], decay: [0, 0.5, 'lin'], sustain: [0, 1, 'lin'],
  release: [0, 1.5, 'lin'], room: [0, 1, 'lin'], roomsize: [0, 1, 'lin'],
  size: [0, 1, 'lin'], delay: [0, 0.8, 'lin'], delaytime: [0.05, 0.75, 'lin'],
  delayfeedback: [0, 0.8, 'lin'], distort: [0, 1, 'lin'], shape: [0, 1, 'lin'],
  crush: [1, 16, 'lin'], coarse: [1, 16, 'lin'], fm: [0, 8, 'lin'],
  fmh: [0.5, 8, 'lin'], vib: [0, 8, 'lin'], vibmod: [0, 1, 'lin'],
};
const COVERAGE_INT = new Set(['crush', 'coarse', 'lpf', 'cutoff', 'hpf']);
// S3: rotate drum banks so the model can't memorize one machine (the critique
// flagged 909/808 memorization).
const COVERAGE_BANKS = ['RolandTR909', 'RolandTR808', 'RolandTR707', 'LinnDrum',
  'AkaiLinn', 'ViscoSpaceDrum', 'CasioRZ1', 'EmuDrumulator'];
const DRUM_RE = /\b(bd|sd|hh|oh|ch|cp|rim|cr|rd|lt|mt|ht|perc|sn|kick|snare|hat)\b/;

function coverageValue(rng, fn) {
  const r = COVERAGE_RANGES[fn];
  if (!r) return null;
  const [lo, hi, scale] = r;
  let v = scale === 'log'
    ? Math.exp(Math.log(lo) + rng() * (Math.log(hi) - Math.log(lo)))
    : lo + rng() * (hi - lo);
  if (rng() < 0.10) {  // over-sample the extremes
    v = rng() < 0.5 ? lo + rng() * (hi - lo) * 0.1 : hi - rng() * (hi - lo) * 0.1;
  }
  return fmtNum(COVERAGE_INT.has(fn) ? Math.round(v) : +v.toFixed(3));
}

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

// ---------- sequence content: variable-order back-off Markov + temperature ----
// Build, per function, context→next-token counts for every order 1..MAX_ORDER,
// plus a unigram fallback. At each step condition on the LONGEST suffix of the
// generated prefix that was seen in the corpus (so after "c3 e3" we follow the
// real phrase to "g3" instead of alternating back to "c3"); back off to shorter
// contexts, then unigram. Sampling uses temperature TEMP for volatility.
function buildSeqModel(m) {
  const orders = new Map();                       // order → Map(ctxStr → Map(tok→count))
  for (let o = 1; o <= MAX_ORDER; o++) orders.set(o, new Map());
  const unigram = new Map();
  for (const seq of m.sequences) {
    for (let i = 0; i < seq.length; i++) {
      const tok = seq[i];
      unigram.set(tok, (unigram.get(tok) || 0) + 1);
      for (let o = 1; o <= MAX_ORDER && o <= i; o++) {
        const ctx = seq.slice(i - o, i).join(' ');
        const tbl = orders.get(o);
        let counts = tbl.get(ctx);
        if (!counts) { counts = new Map(); tbl.set(ctx, counts); }
        counts.set(tok, (counts.get(tok) || 0) + 1);
      }
    }
  }
  return { orders, unigram, length: m.length, start: m.start };
}
const seqModels = Object.fromEntries(
  Object.entries(contentModels).map(([fn, m]) => [fn, buildSeqModel(m)]));

function sampleLength(rng, lengthModel) {
  const entries = Object.entries(lengthModel.counts);   // [["1",100],["4",83],…]
  const total = entries.reduce((s, [, v]) => s + v, 0);
  let r = rng() * total;
  for (const [k, v] of entries) { r -= v; if (r <= 0) return parseInt(k, 10); }
  return parseInt(entries[entries.length - 1][0], 10);
}

// temperature pick over [token, weight] pairs: p_i = (w_i/Σw)^TEMP, renormalized.
function tempPick(rng, pairs, temp) {
  const total = pairs.reduce((s, [, w]) => s + w, 0) || 1;
  const powed = pairs.map(([tok, w]) => [tok, Math.pow(w / total, temp)]);
  const ptot = powed.reduce((s, [, w]) => s + w, 0);
  let r = rng() * ptot;
  for (const [tok, w] of powed) { r -= w; if (r <= 0) return tok; }
  return powed[powed.length - 1][0];
}

function synthSequence(rng, fn) {
  const model = seqModels[fn];
  if (!model) return null;
  const L = Math.min(MAX_LEN, Math.max(MIN_LEN, sampleLength(rng, model.length)));
  const out = [tempPick(rng, model.start.map((s) => [s.token, s.prob]), TEMP)];
  while (out.length < L) {
    let candidates = null;
    // longest matching suffix context first, then back off
    for (let o = Math.min(out.length, MAX_ORDER); o >= 1 && !candidates; o--) {
      const ctx = out.slice(out.length - o).join(' ');
      const counts = model.orders.get(o).get(ctx);
      if (counts && counts.size) candidates = [...counts.entries()];
    }
    if (!candidates) candidates = [...model.unigram.entries()];   // unigram fallback
    out.push(tempPick(rng, candidates, TEMP));
  }
  return JSON.stringify(out.join(' '));
}

// ---------- content: P(content | function) ----------------------------------
function sampleContent(rng, fn) {
  // S1: for timbre params, override the corpus value with a coverage draw 85%
  // of the time (keep 15% corpus-grounded).
  if (TIMBRE_COVERAGE && COVERAGE_RANGES[fn] && rng() < 0.85) {
    const cv = coverageValue(rng, fn);
    if (cv !== null) return cv;
  }
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
  // sequence functions (note/n/s/sound): synthesize a new token sequence
  if (seqModels[fn]) {
    const seq = synthSequence(rng, fn);
    if (seq) return seq;
  }
  // categorical string functions (bank/scale/vowel/…): sample a whole valid value
  if (st.strings?.length) {
    return JSON.stringify(weightedPick(rng, st.strings, (x) => x.prob).value);
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
  // base draw from corpus $:/stack quartiles (≈2–3), then spread toward MAX_VOICES
  // so a raised cap yields denser songs with variety rather than a hard clamp.
  const { '25%': q1, '50%': q2, '75%': q3 } = complexity.voices;
  const r = rng();
  let v = Math.round(r < 0.25 ? q1 : r < 0.5 ? q2 : r < 0.75 ? q3 : q3 + 1);
  while (v < MAX_VOICES && rng() < 0.35) v++;
  return Math.max(MIN_VOICES, Math.min(MAX_VOICES, v));
}

export function generateSong(seed) {
  const rng = mulberry32(seed);
  const lines = [];
  const voices = sampleVoices(rng);
  for (let v = 0; v < voices; v++) {
    let chain = sampleChain(rng);
    for (let tries = 0; !chain.length && tries < 5; tries++) chain = sampleChain(rng);
    if (!chain.length) continue;
    // S1: give a synth voice (pitched, no explicit sound) a uniformly-chosen
    // waveform so timbre isn't sawtooth-dominated.
    if (TIMBRE_COVERAGE) {
      const fns = new Set(chain.map((c) => c.fn));
      const hasPitch = [...fns].some((f) => PITCH_ASSIGN.has(f));
      const hasSound = [...fns].some((f) => SAMPLE_ASSIGN.has(f));
      if (hasPitch && !hasSound) {
        const wf = COVERAGE_WAVEFORMS[Math.floor(rng() * COVERAGE_WAVEFORMS.length)];
        chain.push({ fn: 's', content: JSON.stringify(wf) });
      }
      // S3: a drum voice with no bank → rotate the drum machine.
      const soundVoice = chain.find((c) => SAMPLE_ASSIGN.has(c.fn));
      if (soundVoice && !hasPitch && !fns.has('bank') && DRUM_RE.test(soundVoice.content)) {
        const bank = COVERAGE_BANKS[Math.floor(rng() * COVERAGE_BANKS.length)];
        chain.push({ fn: 'bank', content: JSON.stringify(bank) });
      }
    }
    lines.push('$: ' + chain.map(({ fn, content }) => `${fn}(${content})`).join('.'));
  }
  return { code: lines.join('\n\n') + '\n', voices: lines.length, seed };
}

// ---------- YAML output ------------------------------------------------------
// Hand-rolled (no deps). `code` uses a literal block scalar `|` so the pattern
// keeps real newlines with no quote-escaping and no blank-line placeholders.
function toYaml({ generator, params, count, songs }) {
  const L = [`generator: ${generator}`, 'params:'];
  for (const [k, v] of Object.entries(params)) L.push(`  ${k}: ${v}`);
  L.push(`count: ${count}`, 'songs:');
  for (const s of songs) {
    // id is quoted: YAML 1.1 treats underscores in bare scalars as digit
    // separators, so an unquoted "1000_0" silently parses as the int 10000.
    L.push(`  - id: "${s.id}"`, `    seed: ${s.seed}`, `    voices: ${s.voices}`);
    if (!s.code) { L.push('    code: ""'); continue; }
    L.push('    code: |');
    for (const line of s.code.split('\n')) L.push(line === '' ? '' : `      ${line}`);
  }
  return L.join('\n') + '\n';
}

// ---------- CLI --------------------------------------------------------------
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (name, dflt) => {
    const i = process.argv.indexOf(`--${name}`);
    return i > -1 ? process.argv[i + 1] : dflt;
  };
  const n = parseInt(arg('n', '5'), 10);
  const seed = parseInt(arg('seed', '42'), 10);
  const out = arg('out', null);          // dir of individual .js files
  const yamlPath = arg('yaml', null);    // single YAML file with all songs
  TEMP = parseFloat(arg('temp', String(TEMP)));
  MIN_VOICES = parseInt(arg('min-voices', String(MIN_VOICES)), 10);
  MAX_VOICES = parseInt(arg('max-voices', String(MAX_VOICES)), 10);
  MIN_LEN = parseInt(arg('min-len', String(MIN_LEN)), 10);
  MAX_LEN = parseInt(arg('max-len', String(MAX_LEN)), 10);
  TIMBRE_COVERAGE = process.argv.includes('--timbre-coverage');  // S1 (B6)

  if (out) mkdirSync(out, { recursive: true });
  const collected = [];
  for (let i = 0; i < n; i++) {
    const song = generateSong(seed + i);
    const header = `// synthetic strudel pattern — seed ${song.seed}, ${song.voices} voice(s)\n// generator: data_gen/generate.mjs (sampled from analysis/results/)\n\n`;
    collected.push({ id: `${seed}_${i}`, seed: song.seed, voices: song.voices,
      code: song.code.replace(/\n+$/, '') });
    if (out) writeFileSync(join(out, `${seed}_${i}.js`), header + song.code);
    else if (!yamlPath) console.log(`${'='.repeat(60)}\n${header}${song.code}`);
  }
  if (yamlPath) {
    mkdirSync(dirname(yamlPath), { recursive: true });
    writeFileSync(yamlPath, toYaml({
      generator: 'data_gen/generate.mjs',
      params: { n, seed, temp: TEMP, min_voices: MIN_VOICES, max_voices: MAX_VOICES,
                min_len: MIN_LEN, max_len: MAX_LEN, max_order: MAX_ORDER,
                timbre_coverage: TIMBRE_COVERAGE },
      count: collected.length, songs: collected,
    }));
    console.log(`wrote ${collected.length} songs to ${yamlPath}`);
  } else if (out) {
    console.log(`wrote ${n} songs to ${out}`);
  }
}
