// render_offline.mjs — Strudel pattern string -> WAV, no browser (Phase 3 Part B).
//
// SuperDough (Strudel's synth engine) runs on the Web Audio API; here it is
// driven by node-web-audio-api's OfflineAudioContext, so rendering is
// faster-than-realtime and headless. The same pattern string used for label
// extraction (queryArc) is used for audio, so audio and labels cannot drift.
//
// Usage:
//   node render_offline.mjs --file song.js --out song.wav [--cycles 8] [--sr 44100] [--cps 0.5]
//   node render_offline.mjs --code 'note("c3 e3").s("sawtooth")' --out out.wav

import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

// SuperDough expects browser globals (AudioContext, GainNode, ...) at import
// time — node-web-audio-api provides them all.
import * as webaudio from 'node-web-audio-api';
Object.assign(globalThis, webaudio);

// Browser compat: in browsers, stop() on an already-ended source node is a
// no-op, but node-web-audio-api throws — which sends superdough's
// releaseAudioNode into a start()-twice fallback path that crashes. Make
// stop() idempotent like in the browser.
for (const cls of [webaudio.AudioScheduledSourceNode, webaudio.OscillatorNode, webaudio.AudioBufferSourceNode, webaudio.ConstantSourceNode]) {
  const orig = cls.prototype.stop;
  if (orig) {
    cls.prototype.stop = function (...a) {
      try {
        return orig.apply(this, a);
      } catch {
        /* already stopped/ended */
      }
    };
  }
}

const { setAudioContext, registerSynthSounds, registerZZFXSounds, samples, superdough, loadWorklets } = await import(
  'superdough'
);
const { evalScope } = await import('@strudel/core');
const { evaluate } = await import('@strudel/transpiler');

const { values: args } = parseArgs({
  options: {
    code: { type: 'string' },
    file: { type: 'string' },
    out: { type: 'string', default: 'out.wav' },
    cycles: { type: 'string', default: '8' },
    sr: { type: 'string', default: '44100' },
    cps: { type: 'string', default: '0.5' },
    tail: { type: 'string', default: '2' }, // seconds of release/reverb tail
  },
});

const code = args.code ?? readFileSync(args.file, 'utf8');
const cycles = Number(args.cycles);
const sampleRate = Number(args.sr);
const cps = Number(args.cps);
const tail = Number(args.tail);
const duration = cycles / cps + tail;

// Strudel functions (note, s, stack, ...) must be in the eval scope.
await evalScope(import('@strudel/core'), import('@strudel/mini'));

const ctx = new webaudio.OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
setAudioContext(ctx);

// Sounds: synths (sawtooth, square, ...) + the sample banks the corpus uses.
await registerSynthSounds();
registerZZFXSounds?.();
try {
  await loadWorklets(); // distortion/coarse/crush etc.; native nodes work without it
} catch (e) {
  console.warn('worklets unavailable, continuing without:', e.message);
}
await samples('github:tidalcycles/dirt-samples'); // bd/sd/hh/cp defaults
await samples('https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json'); // .bank("RolandTR909") etc.

const { pattern } = await evaluate(code);
const haps = pattern.queryArc(0, cycles).filter((h) => h.hasOnset());
console.log(`pattern ok: ${haps.length} events over ${cycles} cycles (${duration - tail}s + ${tail}s tail)`);

for (const hap of haps) {
  const t = hap.whole.begin.valueOf() / cps;
  const dur = hap.duration.valueOf() / cps;
  try {
    await superdough(hap.value, t, dur, cps, hap.whole.begin.valueOf());
  } catch (e) {
    console.warn(`skip event @${t.toFixed(2)}s:`, e.message);
  }
}

const buf = await ctx.startRendering();

// interleave + 16-bit PCM WAV, normalizing if the mix clips
const nCh = buf.numberOfChannels;
const n = buf.length;
let peak = 0;
for (let ch = 0; ch < nCh; ch++) {
  const data = buf.getChannelData(ch);
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(data[i]));
}
const gain = peak > 1 ? 0.95 / peak : 1;
const pcm = new Int16Array(n * nCh);
for (let ch = 0; ch < nCh; ch++) {
  const data = buf.getChannelData(ch);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, data[i] * gain));
    pcm[i * nCh + ch] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
}
const dataBytes = pcm.length * 2;
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + dataBytes, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(nCh, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * nCh * 2, 28);
header.writeUInt16LE(nCh * 2, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(dataBytes, 40);
writeFileSync(args.out, Buffer.concat([header, Buffer.from(pcm.buffer)]));

console.log(
  `wrote ${args.out}: ${duration.toFixed(1)}s, ${sampleRate} Hz, ${nCh}ch, peak ${peak.toFixed(3)}${gain !== 1 ? ` (normalized x${gain.toFixed(2)})` : ''}`,
);
if (peak === 0) {
  console.error('WARNING: rendered audio is silent!');
  process.exit(2);
}
