// generate.mjs — the LLM stage: events -> grid text -> LLM -> engine-validated
// Strudel code, with up to maxAttempts retries feeding the rejection back.
import { describeGrids, toStepGrid } from './describe.mjs';
import { buildRetryPrompt, buildSystem, buildUserPrompt } from './prompts.mjs';
import { validateStrudel } from './validate.mjs';

const CODE_BLOCK = /```(?:strudel|javascript|js)?\s*\n([\s\S]*?)```/;

export function extractCode(text) {
  const m = text.match(CODE_BLOCK);
  return (m ? m[1] : text).trim();
}

let systemCache = null;

/**
 * @returns {Promise<{code, attempts, describeText, nBars, llm: {model, source}}>}
 * @throws {{code: 'llm_failed'|'validation_exhausted'|'cancelled'}}
 */
export async function generateStrudel({ events, bpm, userPrompt, onProgress, config, llm, signal }) {
  const { grids, nBars } = toStepGrid(events, bpm);
  const describeText = describeGrids(grids, nBars, bpm);
  const expectedPerCycle = events.length / nBars;
  systemCache ??= buildSystem(config.repoRoot);
  const basePrompt = buildUserPrompt(describeText, userPrompt);

  let prompt = basePrompt;
  let lastError = null;
  for (let attempt = 1; attempt <= config.llm.maxAttempts; attempt++) {
    onProgress?.(
      attempt === 1 ? 'writing Strudel code …' : `attempt ${attempt} of ${config.llm.maxAttempts} — fixing: ${lastError?.slice(0, 80)}`,
      { attempt },
    );
    let text, model, source;
    try {
      ({ text, model, source } = await llm.complete(systemCache, prompt, { signal }));
    } catch (e) {
      if (e.code === 'cancelled' || signal?.aborted) throw Object.assign(e, { code: 'cancelled' });
      throw Object.assign(new Error(`LLM call failed: ${String(e.message).slice(0, 300)}`), { code: 'llm_failed' });
    }
    const code = extractCode(text);
    const v = await validateStrudel(code, { expectedPerCycle, config, signal });
    if (v.ok) {
      return { code, attempts: attempt, describeText, nBars, llm: { model, source } };
    }
    lastError = v.error;
    prompt = buildRetryPrompt(basePrompt, code, v.error);
  }
  throw Object.assign(
    new Error(`the model could not produce valid Strudel code (last problem: ${lastError})`),
    { code: 'validation_exhausted' },
  );
}
