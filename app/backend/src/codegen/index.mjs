// codegen/index.mjs — pick how note events become Strudel code (roadmap A7d).
//
//   m2s+polish  (default) deterministic MIDI-To-Strudel, then an LLM pass for
//                readability + the user's guidance. Falls back to the raw tool
//                output if the LLM is unavailable or its result won't evaluate.
//   m2s          the tool alone — no LLM, fully deterministic, always available.
//   llm          the original A2 path: step-grid description -> LLM -> validate.
//
// All three return the same shape, so the job orchestrator and the frontend do
// not care which ran.
import { generateStrudel } from '../llm/generate.mjs';
import { generateWithM2S } from './m2s.mjs';
import { polishCode } from './polish.mjs';

export const CODEGEN_MODES = ['m2s+polish', 'm2s', 'llm'];
export const DEFAULT_CODEGEN = 'm2s+polish';

export function normalizeMode(mode) {
  return CODEGEN_MODES.includes(mode) ? mode : DEFAULT_CODEGEN;
}

/**
 * @returns {Promise<{code, mode, tempoBpm, meta, describeText?, attempts?, llm?}>}
 */
export async function generateCode({
  mode, events, tempoBpm, userPrompt, config, llm, signal, onProgress,
}) {
  const chosen = normalizeMode(mode);

  if (chosen === 'llm') {
    const g = await generateStrudel({
      events, bpm: tempoBpm, userPrompt, config, llm, signal, onProgress,
    });
    return {
      code: g.code,
      mode: 'llm',
      tempoBpm,
      describeText: g.describeText,
      attempts: g.attempts,
      llm: g.llm,
      meta: { codegen: 'llm', nBars: g.nBars },
    };
  }

  const tool = await generateWithM2S({ events, tempoBpm, config, signal, onProgress });

  if (chosen === 'm2s') {
    return {
      code: tool.code,
      mode: 'm2s',
      tempoBpm: tool.tempoBpm,
      meta: { ...tool.meta, polished: false, validated: tool.validation.ok },
    };
  }

  const polish = await polishCode({
    code: tool.code,
    voices: tool.voices,
    events,
    userPrompt,
    config,
    llm,
    signal,
    onProgress,
  });

  return {
    code: polish.code,
    // Report what actually happened, not what was asked for: a fallback to the
    // raw tool output must be visible rather than silently labelled "polished".
    mode: polish.polished ? 'm2s+polish' : 'm2s',
    tempoBpm: tool.tempoBpm,
    llm: polish.llm,
    meta: {
      ...tool.meta,
      requestedMode: 'm2s+polish',
      polished: polish.polished,
      ...(polish.reason ? { polishSkipped: polish.reason } : {}),
      validated: tool.validation.ok,
    },
  };
}
