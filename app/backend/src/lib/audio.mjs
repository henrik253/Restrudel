// audio.mjs — server-side audio inspection and snippet cutting via ffmpeg
// (roadmap A8). The browser used to do this; moving it here means a re-selection
// costs no re-upload, and the backend owns the canonical audio that the
// similarity score (A5) and opt-in storage (A6) both need.
import { runCommand } from './subprocess.mjs';

export const TARGET_SAMPLE_RATE = 16_000;

// Gain staging: modern masters sit at ~0 dBFS with true peaks ABOVE full
// scale, and both mp3 decoding and the 44.1→16 kHz resample materialize
// samples beyond ±1.0. Writing those straight to PCM16 flattens them into
// harmonic distortion across the whole spectrum — the transcriber then reads
// the distortion as notes. So the cut stays float32 through ffmpeg and ONE
// linear gain brings the peak to −1 dBFS before quantization here.
// The target is adjustable per job (Developer slider) within [−24, 0] dBFS.
export const DEFAULT_PEAK_DB = -1;
export const MIN_PEAK_DB = -24;
export const MAX_PEAK_DB = 0;
// Quiet snippets are boosted too (consistent model input level), but capped:
// unbounded up-gain would turn a near-silent selection into loud noise floor.
const MAX_BOOST = 10; // +20 dB

/** Requested target peak (dBFS) -> a safe linear amplitude. */
function targetPeakFor(targetPeakDb) {
  const db = Number.isFinite(targetPeakDb)
    ? Math.min(MAX_PEAK_DB, Math.max(MIN_PEAK_DB, targetPeakDb))
    : DEFAULT_PEAK_DB;
  return 10 ** (db / 20);
}

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
 * exactly the model's input format, peak-normalized to −1 dBFS.
 *
 * `-ss` before `-i` seeks by keyframe (fast); for the accuracy a few seconds of
 * audio needs, it is placed AFTER `-i` so ffmpeg decodes and cuts precisely.
 */
export async function cutToWav(path, startSec, endSec, { ffmpegBin = 'ffmpeg', timeoutMs = 60_000, signal, targetPeakDb } = {}) {
  const duration = endSec - startSec;
  if (!(duration > 0)) throw new Error('snippet end must be after its start');

  const { stdout } = await runCommand(ffmpegBin, [
    '-v', 'error',
    '-i', path,
    '-ss', startSec.toFixed(3),
    '-t', duration.toFixed(3),
    '-ac', '1', // mono
    '-ar', String(TARGET_SAMPLE_RATE),
    '-c:a', 'pcm_f32le', // float: decoder/resample overs survive to be rescaled
    '-f', 'wav',
    'pipe:1',
  ], { timeoutMs, signal, encoding: 'buffer' });

  if (!stdout?.length) throw new Error('ffmpeg produced no audio for this selection');
  return normalizeFloatWavToPcm16(stdout, targetPeakDb);
}

/** Locate the fmt/data chunks of a float32 WAV. ffmpeg writes placeholder RIFF
 * sizes when piping, so sizes are clamped to what the buffer actually holds. */
function parseFloatWav(buf) {
  if (buf.length < 12 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('ffmpeg did not produce a WAV');
  }
  let fmt = null;
  let data = null;
  let o = 12;
  while (o + 8 <= buf.length) {
    const id = buf.toString('ascii', o, o + 4);
    const size = Math.min(buf.readUInt32LE(o + 4), buf.length - (o + 8));
    if (id === 'fmt ' && size >= 16) {
      fmt = {
        audioFormat: buf.readUInt16LE(o + 8),
        channels: buf.readUInt16LE(o + 10),
        sampleRate: buf.readUInt32LE(o + 12),
        bitsPerSample: buf.readUInt16LE(o + 22),
      };
    } else if (id === 'data') {
      data = { offset: o + 8, bytes: size };
    }
    o += 8 + size + (size % 2);
  }
  if (!fmt || !data) throw new Error('WAV is missing its fmt or data chunk');
  if (fmt.audioFormat !== 3 || fmt.bitsPerSample !== 32 || fmt.channels !== 1) {
    throw new Error(`expected mono float32 WAV, got format ${fmt.audioFormat}/${fmt.bitsPerSample}-bit/${fmt.channels}ch`);
  }
  return { sampleRate: fmt.sampleRate, ...data };
}

/** Float32 mono WAV -> PCM16 mono WAV with the peak scaled to the target. */
export function normalizeFloatWavToPcm16(floatWav, targetPeakDb = DEFAULT_PEAK_DB) {
  const { sampleRate, offset, bytes } = parseFloatWav(floatWav);
  const n = Math.floor(bytes / 4);

  let peak = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.abs(floatWav.readFloatLE(offset + i * 4));
    if (a > peak) peak = a;
  }
  const gain = peak > 0 ? Math.min(targetPeakFor(targetPeakDb) / peak, MAX_BOOST) : 1;

  const out = Buffer.alloc(44 + n * 2);
  out.write('RIFF', 0, 'ascii');
  out.writeUInt32LE(36 + n * 2, 4);
  out.write('WAVE', 8, 'ascii');
  out.write('fmt ', 12, 'ascii');
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20); // PCM
  out.writeUInt16LE(1, 22); // mono
  out.writeUInt32LE(sampleRate, 24);
  out.writeUInt32LE(sampleRate * 2, 28);
  out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34);
  out.write('data', 36, 'ascii');
  out.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, floatWav.readFloatLE(offset + i * 4) * gain));
    out.writeInt16LE(Math.round(s < 0 ? s * 0x8000 : s * 0x7fff), 44 + i * 2);
  }
  return out;
}
