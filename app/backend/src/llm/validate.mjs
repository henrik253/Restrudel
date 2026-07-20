// validate.mjs — "does the generated code actually run, at the right density?"
// Evaluation happens in a killable child (validate_worker.mjs); the density
// gate catches the classic failure of a multi-bar string missing .slow(n),
// exactly like scripts/midi_to_strudel.py.
import { fileURLToPath } from 'node:url';
import { runCommand } from '../lib/subprocess.mjs';

const WORKER = fileURLToPath(new URL('./validate_worker.mjs', import.meta.url));

/**
 * @returns {Promise<{ok: true, events: number} | {ok: false, error: string}>}
 */
export async function validateStrudel(code, { expectedPerCycle, config, cycles = 4, signal } = {}) {
  let out;
  try {
    out = await runCommand(process.execPath, [WORKER, '--cycles', String(cycles)], {
      input: code,
      timeoutMs: config.validateTimeoutMs,
      signal,
      env: { ...process.env, DATA_GEN_DIR: config.dataGenDir },
    });
  } catch (e) {
    if (e.code === 'cancelled') throw e;
    return { ok: false, error: `the code did not evaluate: ${String(e.message).slice(0, 300)}` };
  }
  // Strudel logging may precede the JSON — take the last parseable line.
  let parsed = null;
  for (const line of out.stdout.trim().split('\n').reverse()) {
    try {
      const p = JSON.parse(line);
      if (typeof p.ok === 'boolean') { parsed = p; break; }
    } catch { /* not the JSON line */ }
  }
  if (!parsed) return { ok: false, error: 'validator produced no result' };
  if (!parsed.ok) return { ok: false, error: parsed.error };

  if (expectedPerCycle > 0) {
    const perCycle = parsed.events / cycles;
    const ratio = perCycle / expectedPerCycle;
    if (ratio < 0.6 || ratio > 1.5) {
      return {
        ok: false,
        error:
          `the pattern produces ${perCycle.toFixed(0)} events per cycle but the ` +
          `MIDI has ~${expectedPerCycle.toFixed(0)} per bar — timing is off by ` +
          `~${ratio.toFixed(1)}x. Remember: one mini-notation string is ONE ` +
          `cycle; multi-bar strings need .slow(n_bars).`,
      };
    }
  }
  return { ok: true, events: parsed.events };
}
