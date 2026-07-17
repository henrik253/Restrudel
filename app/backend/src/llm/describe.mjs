// describe.mjs — quantize canonical NoteEvents to a per-voice 16th-note step
// grid and render it as compact text for the LLM prompt. Port of
// scripts/midi_to_strudel.py (to_step_grid / describe), driven by seconds +
// BPM instead of MIDI beats.

export const STEPS_PER_BAR = 16; // 16th-note grid, 4/4

// GM drum note -> Strudel sample name (the corpus's bd/sd/hh/cp vocabulary)
export const GM_DRUMS = {
  35: 'bd', 36: 'bd', 37: 'rim', 38: 'sd', 39: 'cp', 40: 'sd',
  41: 'lt', 42: 'hh', 43: 'lt', 44: 'hh', 45: 'mt', 46: 'oh',
  47: 'mt', 48: 'ht', 49: 'crash', 50: 'ht', 51: 'ride', 57: 'crash',
};

const NOTE_NAMES = ['c', 'cs', 'd', 'eb', 'e', 'f', 'fs', 'g', 'gs', 'a', 'bb', 'b'];

export function midiNoteName(n) {
  return `${NOTE_NAMES[((n % 12) + 12) % 12]}${Math.floor(n / 12) - 1}`;
}

/**
 * Quantize to the step grid.
 * @param {import('../events.mjs').NoteEvent[]} events
 * @param {number} bpm
 * @returns {{grids: Map<string, Map<number, string[]>>, nBars: number}}
 */
export function toStepGrid(events, bpm) {
  const secPerBeat = 60 / bpm;
  const grids = new Map(); // voice -> Map(bar -> string[16])
  let nBars = 1;
  for (const e of events) {
    const beat = e.onset / secPerBeat;
    const step = Math.round(beat * (STEPS_PER_BAR / 4)); // 4 beats per bar
    const bar = Math.floor(step / STEPS_PER_BAR);
    const pos = step % STEPS_PER_BAR;
    nBars = Math.max(nBars, bar + 1);
    const voice = e.channel === 'drums' ? 'drums' : 'pitched';
    const cell = e.channel === 'drums' ? (GM_DRUMS[e.pitch] ?? 'perc') : midiNoteName(e.pitch);
    if (!grids.has(voice)) grids.set(voice, new Map());
    const bars = grids.get(voice);
    if (!bars.has(bar)) bars.set(bar, Array(STEPS_PER_BAR).fill('~'));
    const row = bars.get(bar);
    row[pos] = row[pos] === '~' ? cell : `${row[pos]},${cell}`;
  }
  return { grids, nBars };
}

/** Render the grids as prompt text, folding repeated bars. */
export function describeGrids(grids, nBars, bpm) {
  const lines = [`Tempo: ${Math.round(bpm)} bpm; ${nBars} bar(s) of 4/4, 16 steps per bar.`];
  for (const [voice, bars] of grids) {
    lines.push(`\nVoice '${voice}' (steps are 16th notes, '~' = rest):`);
    const seen = new Map();
    for (let b = 0; b < nBars; b++) {
      const row = (bars.get(b) ?? Array(STEPS_PER_BAR).fill('~')).join(' ');
      if (seen.has(row)) {
        lines.push(`  bar ${b + 1}: (same as bar ${seen.get(row)})`);
      } else {
        seen.set(row, b + 1);
        lines.push(`  bar ${b + 1}: ${row}`);
      }
    }
  }
  return lines.join('\n');
}
