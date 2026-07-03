// strudel_eval.mjs — shared "evaluate a Strudel source string" for the offline
// tooling (render_offline.mjs, extract_labels.mjs). One code path so audio and
// labels can never disagree about what a song contains or how fast it runs.
//
// Handles the REPL idioms that plain @strudel/transpiler `evaluate` lacks
// outside the browser REPL:
//   - `setcpm(x)` / `setcps(x)`  -> captured as the song tempo (no scheduler here)
//   - `$: pattern` voices        -> transpiled to `.p(id)`; we shim Pattern.p to
//                                    collect every voice, then stack() them
//   - `$_: pattern` muted voices -> `.q(id)`; collected but excluded
//   - `.scale(...)` etc.          -> @strudel/tonal included in the eval scope
import { evalScope, Pattern, stack } from '@strudel/core';

let scopeReady = null;

/** Evaluate Strudel code. Returns { pattern, cps, cpsSource, voices }. */
export async function evalStrudel(code, { defaultCps = 0.5 } = {}) {
  scopeReady ??= evalScope(import('@strudel/core'), import('@strudel/mini'), import('@strudel/tonal'));
  await scopeReady;

  let cps = null;
  globalThis.setcps = (v) => { cps = Number(v); };
  globalThis.setcpm = (v) => { cps = Number(v) / 60; };

  const voices = [];
  const origP = Pattern.prototype.p;
  const origQ = Pattern.prototype.q;
  Pattern.prototype.p = function () { voices.push(this); return this; };
  Pattern.prototype.q = function () { return this; }; // muted: keep out of the mix

  try {
    const { evaluate } = await import('@strudel/transpiler');
    const { pattern } = await evaluate(code);
    return {
      pattern: voices.length ? stack(...voices) : pattern,
      cps: cps ?? defaultCps,
      cpsSource: cps != null ? 'song' : 'default',
      voices: voices.length || 1,
    };
  } finally {
    if (origP) Pattern.prototype.p = origP; else delete Pattern.prototype.p;
    if (origQ) Pattern.prototype.q = origQ; else delete Pattern.prototype.q;
  }
}
