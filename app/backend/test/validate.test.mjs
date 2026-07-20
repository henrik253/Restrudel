import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateStrudel } from '../src/llm/validate.mjs';
import { findDataGenDir, testConfig } from './helpers.mjs';

const dataGenDir = findDataGenDir();
const config = testConfig({ dataGenDir });
const skip = dataGenDir ? false : 'data_gen node_modules not installed (run npm install in data_gen/)';

test('valid code evaluates and counts onsets', { skip }, async () => {
  const v = await validateStrudel('s("bd sd bd sd")', { config });
  assert.equal(v.ok, true);
  assert.equal(v.events, 16); // 4 onsets x 4 cycles
});

test('syntax garbage fails with the engine error', { skip }, async () => {
  const v = await validateStrudel('this is not (( valid js', { config });
  assert.equal(v.ok, false);
  assert.ok(v.error.length > 0);
});

test('density gate catches a missing .slow (message mentions it)', { skip }, async () => {
  // 16 onsets/cycle against ~4 expected per bar -> ratio 4x
  const v = await validateStrudel('s("bd*16")', { config, expectedPerCycle: 4 });
  assert.equal(v.ok, false);
  assert.match(v.error, /\.slow/);
});

test('density gate passes when .slow makes the rate match', { skip }, async () => {
  const v = await validateStrudel('s("bd*16").slow(4)', { config, expectedPerCycle: 4 });
  assert.equal(v.ok, true);
});

test('an infinite loop is killed by the worker timeout', { skip }, async () => {
  // must be an expression so the transpiler accepts it and evaluation hangs
  const v = await validateStrudel('(() => { while(true){} })()', {
    config: { ...config, validateTimeoutMs: 4000 },
  });
  assert.equal(v.ok, false);
  assert.match(v.error, /timed out/);
});
