// audio.ts — client-side audio: decode the dropped file (also feeds the
// waveform) and slice+resample the selected region to what the model expects
// (16 kHz mono). The backend never needs ffmpeg because of this.

export const TARGET_SAMPLE_RATE = 16000;

export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const bytes = await file.arrayBuffer();
  const ctx = new AudioContext();
  try {
    return await ctx.decodeAudioData(bytes);
  } finally {
    void ctx.close();
  }
}

/**
 * Slice [startSec, endSec) out of the buffer, downmix to mono and resample to
 * 16 kHz in one OfflineAudioContext render.
 */
export async function sliceAndResample(
  buffer: AudioBuffer,
  startSec: number,
  endSec: number,
): Promise<Float32Array> {
  const durationSec = endSec - startSec;
  const frames = Math.round(durationSec * TARGET_SAMPLE_RATE); // round, never ceil: trailing silence shifts density math
  const ctx = new OfflineAudioContext(1, frames, TARGET_SAMPLE_RATE);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(ctx.destination);
  src.start(0, startSec, durationSec);
  const rendered = await ctx.startRendering();
  return rendered.getChannelData(0);
}
