// helpers.mjs — shared test utilities.
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadConfig } from '../src/config.mjs';

/**
 * Locate a data_gen with installed node_modules. In a git worktree the
 * checkout's own data_gen has no node_modules — fall back to the main
 * checkout (worktrees live at <repo>/.claude/worktrees/<name>).
 */
export function findDataGenDir() {
  const base = loadConfig({}).repoRoot;
  const candidates = [
    process.env.DATA_GEN_DIR,
    join(base, 'data_gen'),
    resolve(base, '..', '..', '..', 'data_gen'),
  ].filter(Boolean);
  for (const dir of candidates) {
    if (existsSync(join(dir, 'strudel_eval.mjs')) && existsSync(join(dir, 'node_modules', '@strudel', 'core'))) {
      return dir;
    }
  }
  return null;
}

export function testConfig(overrides = {}) {
  const config = loadConfig({});
  return {
    ...config,
    ...overrides,
    llm: { ...config.llm, ...(overrides.llm ?? {}) },
    limits: { ...config.limits, ...(overrides.limits ?? {}) },
    runpod: { ...config.runpod, ...(overrides.runpod ?? {}) },
  };
}

/** Synthetic 16 kHz mono PCM16 WAV of `seconds` of a 440 Hz sine. */
export function makeTestWav(seconds, sampleRate = 16000) {
  const n = Math.round(seconds * sampleRate);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8, 'ascii');
  buf.write('fmt ', 12, 'ascii');
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36, 'ascii');
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 12000), 44 + i * 2);
  }
  return buf;
}

/** Frame a binary job.create message: [u32 headerLen][JSON][wav]. */
export function encodeJobCreate(header, wav) {
  const json = Buffer.from(JSON.stringify({ type: 'job.create', ...header }), 'utf8');
  const frame = Buffer.alloc(4 + json.length + wav.length);
  frame.writeUInt32BE(json.length, 0);
  json.copy(frame, 4);
  wav.copy(frame, 4 + json.length);
  return frame;
}
