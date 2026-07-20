// tempo.mjs — BPM estimate from note onsets, used when the transcriber gives
// no tempo. Scores how well each candidate BPM's 16th-note grid aligns with
// the onsets; a mild slow-tempo prior counters the fact that finer grids fit
// everything trivially. Good enough for 3-10 s snippets; the UI exposes a BPM
// override for when it is wrong (regenerate is cheap, no re-transcription).

export function estimateBpm(events, { min = 70, max = 180 } = {}) {
  const onsets = [...new Set(events.map((e) => Math.round(e.onset * 1000) / 1000))].sort((a, b) => a - b);
  if (onsets.length < 4) return null;
  let best = null;
  for (let bpm = min; bpm <= max; bpm++) {
    const grid = 60 / bpm / 4; // 16th-note duration
    let score = 0;
    for (const t of onsets) {
      const d = Math.abs(t / grid - Math.round(t / grid)); // 0..0.5 in grid units
      score += 1 - Math.min(1, d * 2);
    }
    score = score / onsets.length - bpm / 3000;
    if (!best || score > best.score) best = { bpm, score };
  }
  return best.bpm;
}
