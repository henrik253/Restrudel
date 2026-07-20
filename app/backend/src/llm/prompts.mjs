// prompts.mjs — the LLM prompt. SYSTEM ported from scripts/midi_to_strudel.py
// (incl. the load-bearing timing rule), extended with corpus style priors
// measured in analysis/results/. The user's guidance prompt is spliced in as a
// clearly-delimited block so it can steer style but not override the rules.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SYSTEM_BASE = `You convert transcribed MIDI (as a step grid) into Strudel REPL code.

Strudel essentials:
- stack(a, b, ...) layers voices; one cycle = one bar by default.
- Mini-notation: note("c2 eb2 g1 ~") for pitched, s("bd ~ hh cp") for drums;
  "~" is a rest. 16 tokens = 16th-note grid. Prefer coarser grids when steps
  are empty: "bd*2" repeats, "[hh hh]" subdivides, "<a b>" alternates per cycle.
- Pitched synth voices: .s("sawtooth") with .lpf(800) is the idiomatic
  electronic sound; add .release(.1) for short bass notes.
- Drums: s(...).bank("RolandTR909") for electronic drum sounds.
- TIMING RULE: one cycle = one bar. A mini-notation string is ONE cycle, no
  matter how many tokens it has — 64 tokens in one string play 4x too fast.
  If bars differ, either alternate bars with <[bar1] [bar2]> or concatenate
  them and append .slow(n_bars).
- Every bar must keep its exact step count (16 tokens on a 16th grid) unless
  you simplify losslessly (e.g. "hh ~ ~ ~" x4 -> "hh*4" over the bar).

Rules:
- Reproduce the RHYTHM and PITCHES faithfully; simplify notation when possible.
- Follow the user's guidance for sound design and style, never for timing.
- Output ONLY one JavaScript code block, no explanation.`;

const BANK_NAMES = {
  rolandtr909: 'RolandTR909',
  rolandtr808: 'RolandTR808',
  rolandtr707: 'RolandTR707',
  akailinn: 'AkaiLinn',
  rhythmace: 'RhythmAce',
  viscospacedrum: 'ViscoSpaceDrum',
};

/** One paragraph of measured corpus style, or '' when analysis/ is absent. */
export function corpusPriors(repoRoot) {
  try {
    const load = (f) => JSON.parse(readFileSync(join(repoRoot, 'analysis', 'results', f), 'utf8'));
    const synths = load('sounds.json').items
      .filter((i) => i.category === 'waveform-synth')
      .slice(0, 3)
      .map((i) => i.name);
    const banks = load('banks.json').items
      .slice(0, 2)
      .map((i) => BANK_NAMES[i.name] ?? i.name);
    if (!synths.length && !banks.length) return '';
    return (
      `\n\nCorpus style priors (measured from real Strudel songs — use as defaults ` +
      `when the user gives no guidance): dominant synths ${synths.join(', ')}, ` +
      `typically shaped with .lpf(), .release(), .room()/.delay(); ` +
      `drum banks ${banks.join(' and ')}.`
    );
  } catch {
    return '';
  }
}

export function buildSystem(repoRoot) {
  return SYSTEM_BASE + corpusPriors(repoRoot);
}

export function buildUserPrompt(summary, userPrompt) {
  let p =
    'Transcribed MIDI content:\n\n' +
    summary +
    '\n\nWrite Strudel code that reproduces this. Output only the code block.';
  if (userPrompt?.trim()) {
    p += `\n\nUser guidance (style/sound design only — the timing rules always win):\n${userPrompt.trim()}`;
  }
  return p;
}

export function buildRetryPrompt(basePrompt, prevCode, rejection) {
  return `${basePrompt}\n\nYour previous attempt:\n\`\`\`js\n${prevCode}\n\`\`\`\nwas rejected: ${rejection}\nFix it.`;
}
