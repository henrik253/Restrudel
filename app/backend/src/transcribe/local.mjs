// local.mjs — run the fine-tuned YourMT3+ locally on CPU via the existing
// scripts/yourmt3_transcribe.py (needs the repo's .venv and models/ checkout).
// Slow (~30 s model load + inference) but real; the job narration covers it.
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import toneMidi from '@tonejs/midi'; // CJS package — no named ESM exports

const { Midi } = toneMidi;
import { fromToneMidi, sanitizeEvents } from '../events.mjs';
import { runCommand } from '../lib/subprocess.mjs';

export function createLocalTranscriber(config) {
  const script = join(config.repoRoot, 'scripts', 'yourmt3_transcribe.py');
  return {
    name: 'local',
    async transcribe(wavBuffer, { onProgress, signal } = {}) {
      const dir = await mkdtemp(join(tmpdir(), 'restrudel-'));
      const wavPath = join(dir, 'in.wav');
      const midPath = join(dir, 'out.mid');
      try {
        await writeFile(wavPath, wavBuffer);
        onProgress?.('loading the model — this takes a while on CPU …');
        await runCommand(config.pythonBin, [script, wavPath, '-o', midPath], {
          cwd: config.repoRoot,
          timeoutMs: 10 * 60_000,
          signal,
          onStderrLine: (line) => onProgress?.(line.slice(0, 120)),
        });
        const midi = new Midi(await readFile(midPath));
        const { events, tempoBpm } = fromToneMidi(midi);
        return { events: sanitizeEvents(events), tempoBpm, meta: { adapter: 'local' } };
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    },
  };
}
