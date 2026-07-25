// polish.mjs — make MIDI-To-Strudel's output readable and idiomatic (A7c).
//
// The tool is deterministic and faithful but writes machine-flavoured code:
// every voice is `note(...).sound("piano")`, and because it has no drum
// handling at all, drum hits come out as melodic notes (kick -> "c2"). This
// stage fixes presentation and applies the user's optional guidance, under one
// hard rule: DO NOT CHANGE THE NOTES.
//
// It never fails a job. If the LLM is unavailable or its output does not
// evaluate, the caller keeps the unpolished (still valid) tool output.
import { corpusPriors } from '../llm/prompts.mjs';
import { extractCode } from '../llm/generate.mjs';
import { validateStrudel } from '../llm/validate.mjs';

// General MIDI percussion map, restricted to what our model actually emits and
// what Strudel's drum banks provide. Used to tell the LLM which "notes" in the
// drum voice are really which drums.
const GM_DRUMS = {
  35: 'bd (acoustic kick)', 36: 'bd (kick)', 37: 'rim (side stick)',
  38: 'sd (snare)', 39: 'cp (hand clap)', 40: 'sd (electric snare)',
  41: 'lt (low tom)', 42: 'hh (closed hi-hat)', 43: 'lt (high floor tom)',
  44: 'hh (pedal hi-hat)', 45: 'mt (low tom)', 46: 'oh (open hi-hat)',
  47: 'mt (low-mid tom)', 48: 'ht (hi-mid tom)', 49: 'cr (crash)',
  50: 'ht (high tom)', 51: 'rd (ride)', 52: 'cr (china)', 53: 'rd (ride bell)',
  54: 'tb (tambourine)', 55: 'cr (splash)', 56: 'cb (cowbell)',
  57: 'cr (crash 2)', 59: 'rd (ride 2)', 75: 'cl (claves)',
};

const SYSTEM = `You clean up auto-generated Strudel live-coding code.

The code was produced mechanically from transcribed MIDI. It is already
correct in timing and pitch. Your job is presentation and sound design.

ABSOLUTE RULES — breaking these makes the output wrong:
- NEVER change note pitches, their order, or their timing/rhythm.
- NEVER add or remove notes, bars, or voices.
- Keep setcpm(...) exactly as it is.
- Keep each mini-notation string the same number of cycles. One string is ONE
  cycle; if you merge bars you must add .slow(n_bars).

WHAT TO DO:
- Convert any voice marked as DRUMS from note(...) into idiomatic drum
  notation: s("bd ~ sd ~") using the drum names given, on the same grid
  positions, with .bank("RolandTR909") (or another bank if the user asks).
  Rests stay "~". A drum voice must NOT use note(...) or note names.
- Give pitched voices a fitting sound: .s("sawtooth")/.s("square")/.s("supersaw")
  with .lpf(...), .release(...), optionally .room()/.delay(). Replace the
  tool's guessed .sound("...") when a synth fits the material better.
- Wrap the voices in stack(...) only if they are not already using $:.
  Either form is fine — do not restructure for its own sake.
- Improve readability: sensible line breaks and indentation.
- Output ONLY one JavaScript code block. No explanation.`;

/** Name the drum pitches present so the LLM can map positions to drum names. */
function drumLegend(events) {
  const pitches = [...new Set(events.filter((e) => e.channel === 'drums').map((e) => e.pitch))]
    .sort((a, b) => a - b);
  if (!pitches.length) return '';
  const lines = pitches.map((p) => {
    const name = GM_DRUMS[p] ?? 'perc (unmapped — pick a reasonable drum)';
    // The tool renders drum pitches as note names; give the LLM both spellings
    // so it can find them in the code it is editing.
    return `  - ${noteName(p)} (MIDI ${p}) = ${name}`;
  });
  return `\nThe DRUMS voice uses these note names for drums:\n${lines.join('\n')}`;
}

const NOTE_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
function noteName(pitch) {
  return `${NOTE_NAMES[pitch % 12]}${Math.floor(pitch / 12) - 1}`;
}

export function buildPolishPrompt({ code, voices, userPrompt, events }) {
  const voiceLines = voices.map((v, i) => {
    const what = v.isDrums
      ? 'DRUMS — rewrite as s("...") drum notation'
      : `pitched instrument (GM program ${v.program})`;
    return `  ${i + 1}. voice ${i + 1} (${v.noteCount} notes): ${what}`;
  }).join('\n');

  let prompt = `Here is auto-generated Strudel code:\n\n\`\`\`js\n${code}\n\`\`\`\n\n`;
  if (voiceLines) {
    prompt += `The voices, in the order they appear:\n${voiceLines}\n`;
  }
  prompt += drumLegend(events ?? []);
  prompt += '\n\nClean it up following your rules. Output only the code block.';
  if (userPrompt?.trim()) {
    prompt +=
      `\n\nUser guidance (sound design and style only — never timing or pitch):\n${userPrompt.trim()}`;
  }
  return prompt;
}

/**
 * Polish tool output. Never throws except on cancellation.
 *
 * @returns {Promise<{code, polished: boolean, reason?: string, llm?: object}>}
 */
export async function polishCode({
  code, voices = [], events = [], userPrompt, config, llm, signal, onProgress,
}) {
  const system = SYSTEM + corpusPriors(config.repoRoot);
  const prompt = buildPolishPrompt({ code, voices, userPrompt, events });

  onProgress?.('polishing the code …');
  let text;
  let meta = {};
  try {
    const res = await llm.complete(system, prompt, { signal });
    text = res.text;
    meta = { model: res.model, source: res.source };
  } catch (e) {
    if (e.code === 'cancelled' || signal?.aborted) throw Object.assign(e, { code: 'cancelled' });
    // The unpolished code is still valid and playable — degrade, don't fail.
    return { code, polished: false, reason: `LLM unavailable: ${String(e.message).slice(0, 200)}` };
  }

  const polished = extractCode(text);
  if (!polished) {
    return { code, polished: false, reason: 'the model returned no code block' };
  }

  const v = await validateStrudel(polished, { config, signal });
  if (!v.ok) {
    return { code, polished: false, reason: `polished code did not evaluate: ${v.error}`, llm: meta };
  }

  return { code: polished, polished: true, llm: meta, events: v.events };
}
