// codegen.test.mjs — mode selection and the polish stage's fallback behaviour.
//
// The load-bearing property: polish must NEVER cost the user their result. If
// the LLM is down, returns junk, or returns code that will not evaluate, the
// deterministic tool output has to come back instead — labelled honestly.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CODEGEN_MODES, generateCode, normalizeMode } from '../src/codegen/index.mjs';
import { buildPolishPrompt, polishCode } from '../src/codegen/polish.mjs';
import { findDataGenDir, findM2SDir, findPythonBin, testConfig } from './helpers.mjs';

const m2sDir = findM2SDir();
const dataGenDir = findDataGenDir();
const needsTool = !m2sDir ? 'MIDI-To-Strudel submodule not initialized' : false;
const needsEngine = !dataGenDir ? 'data_gen node_modules not installed' : false;

const config = testConfig({
  ...(dataGenDir ? { dataGenDir } : {}),
  pythonBin: findPythonBin(),
  m2s: { ...(m2sDir ? { dir: m2sDir } : {}) },
});

const events = (() => {
  const out = [];
  for (let beat = 0; beat < 8; beat++) {
    const t = beat * 0.5;
    out.push({ onset: t, duration: 0.1, pitch: 36, velocity: 100, channel: 'drums' });
    out.push({ onset: t + 0.25, duration: 0.05, pitch: 42, velocity: 80, channel: 'drums' });
    out.push({ onset: t, duration: 0.4, pitch: 33 + (beat % 4), velocity: 96, channel: 'pitched', program: 38 });
  }
  return out.sort((a, b) => a.onset - b.onset);
})();

/** An LLM stub whose reply we control. */
const stubLlm = (reply) => ({
  async complete() {
    if (reply instanceof Error) throw reply;
    return { text: reply, model: 'stub', source: 'stub' };
  },
});

describe('codegen mode selection', () => {
  it('defaults unknown or missing modes to m2s+polish', () => {
    assert.equal(normalizeMode(undefined), 'm2s+polish');
    assert.equal(normalizeMode('nonsense'), 'm2s+polish');
    assert.equal(normalizeMode('llm'), 'llm');
    assert.deepEqual(CODEGEN_MODES, ['m2s+polish', 'm2s', 'llm']);
  });
});

describe('polish prompt', () => {
  it('names each voice and translates drum pitches to drum names', () => {
    const prompt = buildPolishPrompt({
      code: 'setcpm(120/4)\n$: note(`<c2>`)',
      voices: [
        { isDrums: true, program: 118, noteCount: 16 },
        { isDrums: false, program: 38, noteCount: 8 },
      ],
      events,
      userPrompt: 'make it darker',
    });

    assert.match(prompt, /DRUMS — rewrite as s\("\.\.\."\)/);
    assert.match(prompt, /GM program 38/);
    // Pitch 36 is a kick and appears as "c2" in the tool's output; the prompt
    // has to give both spellings or the model cannot find it in the code.
    assert.match(prompt, /c2 \(MIDI 36\) = bd \(kick\)/);
    assert.match(prompt, /f#2 \(MIDI 42\) = hh \(closed hi-hat\)/);
    assert.match(prompt, /make it darker/);
  });

  it('omits the drum legend when there are no drums', () => {
    const prompt = buildPolishPrompt({
      code: 'x', voices: [{ isDrums: false, program: 80, noteCount: 4 }],
      events: events.filter((e) => e.channel === 'pitched'),
    });
    assert.doesNotMatch(prompt, /uses these note names for drums/);
  });
});

describe('polish never costs the user their result', { skip: needsEngine }, () => {
  const toolCode = 'setcpm(120/4)\n\n$: note(`<c2 e2 g2 c3>`)\n  .sound("piano")';

  it('keeps tool output when the LLM fails', async () => {
    const res = await polishCode({
      code: toolCode, voices: [], events, config, llm: stubLlm(new Error('network down')),
    });
    assert.equal(res.polished, false);
    assert.equal(res.code, toolCode);
    assert.match(res.reason, /LLM unavailable/);
  });

  it('keeps tool output when the model returns no code', async () => {
    const res = await polishCode({
      code: toolCode, voices: [], events, config, llm: stubLlm(''),
    });
    assert.equal(res.polished, false);
    assert.equal(res.code, toolCode);
  });

  it('keeps tool output when the polished code does not evaluate', async () => {
    const res = await polishCode({
      code: toolCode, voices: [], events, config,
      llm: stubLlm('```js\nthis is (not( valid strudel\n```'),
    });
    assert.equal(res.polished, false);
    assert.equal(res.code, toolCode);
    assert.match(res.reason, /did not evaluate/);
  });

  it('accepts polished code that does evaluate', async () => {
    const good = 's("bd ~ sd ~").bank("RolandTR909")';
    const res = await polishCode({
      code: toolCode, voices: [], events, config, llm: stubLlm('```js\n' + good + '\n```'),
    });
    assert.equal(res.polished, true);
    assert.equal(res.code, good);
    assert.equal(res.llm.source, 'stub');
  });

  it('propagates cancellation instead of silently degrading', async () => {
    const ac = new AbortController();
    ac.abort();
    await assert.rejects(
      () => polishCode({
        code: toolCode, voices: [], events, config, signal: ac.signal,
        llm: { async complete() { throw Object.assign(new Error('cancelled'), { code: 'cancelled' }); } },
      }),
      (err) => err.code === 'cancelled',
    );
  });
});

describe('generateCode end to end', { skip: needsTool || needsEngine }, () => {
  it('m2s mode returns deterministic tool output, no LLM involved', async () => {
    const res = await generateCode({
      mode: 'm2s', events, tempoBpm: 120, config,
      llm: stubLlm(new Error('must not be called')),
    });
    assert.equal(res.mode, 'm2s');
    assert.equal(res.meta.polished, false);
    assert.match(res.code, /setcpm\(120\/4\)/);
    assert.equal(res.meta.validated, true);
  });

  it('m2s+polish reports the real mode when polish falls back', async () => {
    const res = await generateCode({
      mode: 'm2s+polish', events, tempoBpm: 120, config,
      llm: stubLlm(new Error('LLM down')),
    });
    // Asked for polish, got the tool output — the label must say so.
    assert.equal(res.mode, 'm2s');
    assert.equal(res.meta.requestedMode, 'm2s+polish');
    assert.equal(res.meta.polished, false);
    assert.match(res.meta.polishSkipped, /LLM unavailable/);
    assert.ok(res.code.includes('setcpm'));
  });

  it('m2s+polish returns polished code when the LLM cooperates', async () => {
    const good = 'stack(s("bd*4").bank("RolandTR909"), note("a1 c2 e2 g2").s("sawtooth").lpf(600))';
    const res = await generateCode({
      mode: 'm2s+polish', events, tempoBpm: 120, config,
      llm: stubLlm('```js\n' + good + '\n```'),
    });
    assert.equal(res.mode, 'm2s+polish');
    assert.equal(res.meta.polished, true);
    assert.equal(res.code, good);
  });
});
