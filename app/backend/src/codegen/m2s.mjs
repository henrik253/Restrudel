// m2s.mjs — deterministic codegen via MIDI-To-Strudel (roadmap A7b).
//
// Runs the pinned third-party tool (vendor/MIDI-To-Strudel, GPL-3.0) as a
// subprocess: canonical events -> .mid -> Strudel code. GPL code is *invoked*,
// never imported or vendored into ours.
//
// Two behaviours of the tool shape this adapter (verified against its source
// and by running it, 2026-07-24):
//   * it prints argparse help to stdout before the result, so we read the
//     `result.txt` it writes instead of parsing stdout;
//   * `result.txt` and its `log.log` are written to the PROCESS CWD, so every
//     job runs in its own scratch directory (also keeps concurrent jobs apart).
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { eventsToMidi } from '../midi/index.mjs';
import { runCommand } from '../lib/subprocess.mjs';
import { validateStrudel } from '../llm/validate.mjs';

const SCRIPT = 'Midi-to-Strudel.py';

const unavailable = (m) => Object.assign(new Error(m), { code: 'codegen_unavailable' });

/** Resolve the tool's checkout and interpreter, or explain how to get them. */
export function resolveM2SScript(config) {
  const dir = config.m2s?.dir;
  const script = dir ? join(dir, SCRIPT) : null;
  if (!script || !existsSync(script)) {
    throw unavailable(
      `MIDI-To-Strudel not found at ${script ?? '(unset)'} — run: git submodule update --init vendor/MIDI-To-Strudel`,
    );
  }
  // An absolute interpreter that does not exist fails deep inside spawn with a
  // bare ENOENT; check here so the message names the actual problem.
  if (config.pythonBin?.includes('/') && !existsSync(config.pythonBin)) {
    throw unavailable(
      `python interpreter not found at ${config.pythonBin} — set PYTHON_BIN (the tool needs the "mido" package)`,
    );
  }
  return script;
}

/**
 * events -> Strudel code, deterministically.
 *
 * @returns {Promise<{code, voices, tempoBpm, meta, validation}>}
 * @throws {{code: 'codegen_unavailable'|'codegen_failed'|'cancelled'}}
 */
export async function generateWithM2S({ events, tempoBpm, config, onProgress, signal } = {}) {
  const script = resolveM2SScript(config);
  if (!events?.length) {
    throw Object.assign(new Error('no note events to convert'), { code: 'codegen_failed' });
  }

  const { buffer, tempoBpm: bpm, voices } = eventsToMidi(events, { tempoBpm });
  const dir = await mkdtemp(join(tmpdir(), 'restrudel-m2s-'));
  try {
    const midPath = join(dir, 'job.mid');
    await writeFile(midPath, buffer);

    onProgress?.('converting MIDI to Strudel …');
    await runCommand(config.pythonBin, [
      script,
      '-m', midPath,
      '-n', String(config.m2s.notesPerBar),
      '-t', String(config.m2s.tabSize),
      ...(config.m2s.guessInstrument ? ['-g'] : []),
    ], {
      cwd: dir, // result.txt + log.log land here, not in the repo
      timeoutMs: config.m2s.timeoutMs,
      signal,
    });

    let code;
    try {
      code = (await readFile(join(dir, 'result.txt'), 'utf8')).trim();
    } catch {
      throw Object.assign(new Error('MIDI-To-Strudel produced no result.txt'), { code: 'codegen_failed' });
    }
    if (!code) {
      throw Object.assign(new Error('MIDI-To-Strudel produced empty output'), { code: 'codegen_failed' });
    }

    // Same engine gate the LLM path uses. No density check: this output is
    // derived from the events by construction, so density cannot drift — the
    // question is only whether the emitted code evaluates.
    const validation = await validateStrudel(code, { config, signal });

    return {
      code,
      voices,
      tempoBpm: bpm,
      validation,
      meta: {
        codegen: 'm2s',
        notesPerBar: config.m2s.notesPerBar,
        guessInstrument: config.m2s.guessInstrument,
        voiceCount: voices.length,
        drumVoices: voices.filter((v) => v.isDrums).length,
      },
    };
  } catch (e) {
    if (e.code === 'cancelled' || e.code === 'codegen_failed' || e.code === 'codegen_unavailable') throw e;
    throw Object.assign(
      new Error(`MIDI-To-Strudel failed: ${String(e.message).slice(0, 300)}`),
      { code: 'codegen_failed' },
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
