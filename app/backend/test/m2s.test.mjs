// m2s.test.mjs — the MIDI-To-Strudel adapter, running the real tool.
//
// Skipped when the submodule or the Strudel engine is unavailable, so a fresh
// checkout still passes `npm test` (see helpers.findM2SDir/findDataGenDir).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { generateWithM2S, resolveM2SScript } from '../src/codegen/m2s.mjs';
import { findDataGenDir, findM2SDir, findPythonBin, testConfig } from './helpers.mjs';

const m2sDir = findM2SDir();
const dataGenDir = findDataGenDir();
const pythonBin = findPythonBin();

const config = testConfig({
  ...(dataGenDir ? { dataGenDir } : {}),
  pythonBin,
  m2s: { ...(m2sDir ? { dir: m2sDir } : {}) },
});

// Two bars at 120 BPM: a bass line under a four-on-the-floor kick + hats.
function demoEvents() {
  const B = 0.5;
  const events = [];
  for (let beat = 0; beat < 8; beat++) {
    const t = beat * B;
    events.push({ onset: t, duration: 0.1, pitch: 36, velocity: 100, channel: 'drums' });
    events.push({ onset: t + B / 2, duration: 0.05, pitch: 42, velocity: 80, channel: 'drums' });
    events.push({ onset: t, duration: 0.4, pitch: 33 + (beat % 4), velocity: 96, channel: 'pitched', program: 38 });
  }
  return events.sort((a, b) => a.onset - b.onset);
}

describe('m2s adapter — configuration', () => {
  it('explains how to fix a missing submodule', () => {
    assert.throws(
      () => resolveM2SScript(testConfig({ m2s: { dir: '/nope/not/here' } })),
      (err) => err.code === 'codegen_unavailable' && /submodule update --init/.test(err.message),
    );
  });

  it('rejects an empty event list rather than emitting empty code', async () => {
    await assert.rejects(
      () => generateWithM2S({ events: [], tempoBpm: 120, config }),
      (err) => err.code === 'codegen_failed' || err.code === 'codegen_unavailable',
    );
  });
});

describe('m2s adapter — real conversion', { skip: !m2sDir ? 'MIDI-To-Strudel submodule not initialized' : false }, () => {
  it('turns events into Strudel code with one voice per instrument', async () => {
    const result = await generateWithM2S({ events: demoEvents(), tempoBpm: 120, config });

    // setcpm carries the tempo; the tool works in cycles of 4 beats.
    assert.match(result.code, /setcpm\(120\/4\)/);
    // One `$:` voice per instrument group: bass (program 38) + drums.
    assert.equal(result.code.match(/\$:/g).length, 2);
    assert.equal(result.meta.voiceCount, 2);
    assert.equal(result.meta.drumVoices, 1);
    assert.equal(result.tempoBpm, 120);

    // The drum voice is reported so the polish stage can rewrite it — the tool
    // renders channel-9 notes melodically, it has no drum notation.
    const drums = result.voices.find((v) => v.isDrums);
    assert.equal(drums.noteCount, 16);
  });

  it('produces code the real Strudel engine accepts',
    { skip: !dataGenDir ? 'data_gen node_modules not installed' : false },
    async () => {
      const result = await generateWithM2S({ events: demoEvents(), tempoBpm: 120, config });
      assert.equal(result.validation.ok, true, `engine rejected it: ${result.validation.error}`);
      assert.ok(result.validation.events > 0);
    });

  // A grid too coarse to separate two hits merges them into a chord, losing
  // the rhythm. Measured 2026-07-24: at 4 steps/bar the kick and off-beat hat
  // collapse into [c2,f#2]; at 16 they resolve to alternating steps. This is
  // why the default is 16 rather than the tool's own 64 (unreadably long) or
  // anything coarser (wrong).
  it('resolves distinct hits at the default grid, collapses them at a coarse one', async () => {
    const coarse = await generateWithM2S({
      events: demoEvents(), tempoBpm: 120,
      config: testConfig({ ...config, m2s: { ...config.m2s, notesPerBar: 4 } }),
    });
    const fine = await generateWithM2S({
      events: demoEvents(), tempoBpm: 120,
      config: testConfig({ ...config, m2s: { ...config.m2s, notesPerBar: 16 } }),
    });

    // The drum group is emitted first (its events sort first), so voice 1.
    const drumLine = (code) => code.split('$:')[1] ?? '';
    assert.match(drumLine(coarse.code), /\[[a-g][#b]?\d,/, 'expected collapsed chords at 4 steps/bar');
    assert.doesNotMatch(drumLine(fine.code), /\[[a-g][#b]?\d,/,
      'kick and hat should occupy separate steps at 16 steps/bar');
    assert.equal(fine.meta.notesPerBar, 16);
  });

  it('cleans up its scratch directory (no result.txt/log.log leak)', async () => {
    const before = process.cwd();
    await generateWithM2S({ events: demoEvents(), tempoBpm: 120, config });
    assert.equal(process.cwd(), before);
    const { existsSync } = await import('node:fs');
    assert.ok(!existsSync('result.txt'), 'result.txt leaked into the cwd');
    assert.ok(!existsSync('log.log'), 'log.log leaked into the cwd');
  });

  it('is cancellable', async () => {
    const ac = new AbortController();
    ac.abort();
    await assert.rejects(
      () => generateWithM2S({ events: demoEvents(), tempoBpm: 120, config, signal: ac.signal }),
      (err) => err.code === 'cancelled' || err.code === 'codegen_failed',
    );
  });
});
