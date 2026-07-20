// mock.mjs — instant deterministic transcription for UI development and tests.
// Two bars at 120 BPM: bd on quarters, sd on 2/4, hh on the off-beats, and a
// four-note bass line. MOCK_DELAY_MS simulates a slow model with progress ticks.

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(Object.assign(new Error('cancelled'), { code: 'cancelled' }));
    }, { once: true });
  });

function mockEvents() {
  const B = 0.5; // seconds per beat at 120 BPM
  const drum = (onset, pitch) => ({ onset, duration: 0.1, pitch, velocity: 100, channel: 'drums' });
  const events = [];
  const bass = [33, 36, 40, 43]; // a1 c2 e2 g2
  for (let bar = 0; bar < 2; bar++) {
    const t0 = bar * 4 * B;
    for (let beat = 0; beat < 4; beat++) {
      events.push(drum(t0 + beat * B, 36)); // bd
      if (beat % 2 === 1) events.push(drum(t0 + beat * B, 38)); // sd on 2 & 4
      events.push(drum(t0 + beat * B + B / 2, 42)); // hh off-beats
      events.push({ onset: t0 + beat * B, duration: 0.4, pitch: bass[beat], velocity: 96, channel: 'pitched' });
    }
  }
  return events.sort((a, b) => a.onset - b.onset || a.pitch - b.pitch);
}

export function createMockTranscriber({ delayMs = 0 } = {}) {
  return {
    name: 'mock',
    async transcribe(_wavBuffer, { onProgress, signal } = {}) {
      if (delayMs > 0) {
        const steps = Math.max(1, Math.ceil(delayMs / 500));
        for (let i = 0; i < steps; i++) {
          onProgress?.('transcribing (mock) …', (i + 1) / steps);
          await sleep(delayMs / steps, signal);
        }
      }
      return { events: mockEvents(), tempoBpm: 120, meta: { adapter: 'mock' } };
    },
  };
}
