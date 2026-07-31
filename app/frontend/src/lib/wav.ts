// wav.ts — minimal PCM16 mono WAV encoder for the job payload.

// Same gain-staging rule as the backend cut (lib/audio.mjs): decodeAudioData
// yields floats beyond ±1 on hot masters, and the old hard clamp flattened
// them into distortion. One linear gain to a −1 dBFS peak instead; quiet
// audio is boosted at most +20 dB so silence never becomes loud noise floor.
const TARGET_PEAK = 10 ** (-1 / 20); // ≈ 0.891
const MAX_BOOST = 10;

export function encodeWavPcm16Mono(samples: Float32Array, sampleRate: number): ArrayBuffer {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]);
    if (a > peak) peak = a;
  }
  const gain = peak > 0 ? Math.min(TARGET_PEAK / peak, MAX_BOOST) : 1;

  const buf = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buf);
  const writeAscii = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] * gain));
    view.setInt16(44 + i * 2, Math.round(s < 0 ? s * 0x8000 : s * 0x7fff), true);
  }
  return buf;
}
