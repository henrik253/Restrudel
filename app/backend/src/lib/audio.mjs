// audio.mjs — server-side audio inspection and snippet cutting via ffmpeg
// (roadmap A8). The browser used to do this; moving it here means a re-selection
// costs no re-upload, and the backend owns the canonical audio that the
// similarity score (A5) and opt-in storage (A6) both need.
import { runCommand } from './subprocess.mjs';

export const TARGET_SAMPLE_RATE = 16_000;

const unsupported = (m) => Object.assign(new Error(m), { code: 'unsupported_media' });

/** Probe duration (seconds) and format; throws `unsupported_media` if undecodable. */
export async function probeAudio(path, { ffprobeBin = 'ffprobe', timeoutMs = 30_000 } = {}) {
  let stdout;
  try {
    ({ stdout } = await runCommand(ffprobeBin, [
      '-v', 'error',
      '-select_streams', 'a:0',
      '-show_entries', 'format=duration,format_name:stream=codec_name,channels,sample_rate',
      '-of', 'json',
      path,
    ], { timeoutMs }));
  } catch (e) {
    throw unsupported(`could not read this audio file: ${String(e.message).slice(0, 200)}`);
  }

  let info;
  try {
    info = JSON.parse(stdout);
  } catch {
    throw unsupported('could not read this audio file (unexpected ffprobe output)');
  }
  const stream = info.streams?.[0];
  const durationSec = Number.parseFloat(info.format?.duration ?? '');
  if (!stream) throw unsupported('no audio stream found in this file');
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    throw unsupported('this file has no measurable audio duration');
  }
  return {
    durationSec,
    codec: stream.codec_name ?? null,
    channels: stream.channels ?? null,
    sampleRate: Number.parseInt(stream.sample_rate ?? '', 10) || null,
    format: info.format?.format_name ?? null,
  };
}

/**
 * Cut [startSec, endSec) and return it as a 16 kHz mono PCM16 WAV buffer —
 * exactly the model's input format.
 *
 * `-ss` before `-i` seeks by keyframe (fast); for the accuracy a few seconds of
 * audio needs, it is placed AFTER `-i` so ffmpeg decodes and cuts precisely.
 */
export async function cutToWav(path, startSec, endSec, { ffmpegBin = 'ffmpeg', timeoutMs = 60_000, signal } = {}) {
  const duration = endSec - startSec;
  if (!(duration > 0)) throw new Error('snippet end must be after its start');

  const { stdout } = await runCommand(ffmpegBin, [
    '-v', 'error',
    '-i', path,
    '-ss', startSec.toFixed(3),
    '-t', duration.toFixed(3),
    '-ac', '1', // mono
    '-ar', String(TARGET_SAMPLE_RATE),
    '-c:a', 'pcm_s16le',
    '-f', 'wav',
    'pipe:1',
  ], { timeoutMs, signal, encoding: 'buffer' });

  if (!stdout?.length) throw new Error('ffmpeg produced no audio for this selection');
  return stdout;
}
