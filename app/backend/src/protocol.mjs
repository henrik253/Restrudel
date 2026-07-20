// protocol.mjs — the WebSocket wire format. Mirrored by app/frontend/src/protocol.ts;
// keep the two in sync (the ws_smoke test exercises the format end-to-end).
//
// Text frames: JSON `{type, ...}`. Exactly one binary frame type (job.create):
//   [uint32 BE header length][UTF-8 JSON header][WAV bytes]

export const MSG = {
  // client -> server
  JOB_CREATE: 'job.create', // binary frame
  JOB_REGENERATE: 'job.regenerate',
  JOB_CANCEL: 'job.cancel',
  JOB_SUBSCRIBE: 'job.subscribe',
  // server -> client
  HELLO: 'hello',
  JOB_ACCEPTED: 'job.accepted',
  JOB_STATUS: 'job.status',
  JOB_RESULT: 'job.result',
  JOB_ERROR: 'job.error',
};

export const ERR = {
  PAYLOAD_TOO_LARGE: 'payload_too_large',
  INVALID_WAV: 'invalid_wav',
  SNIPPET_OUT_OF_RANGE: 'snippet_out_of_range',
  PROMPT_TOO_LONG: 'prompt_too_long',
  BAD_MESSAGE: 'bad_message',
  JOB_NOT_FOUND: 'job_not_found',
  JOB_BUSY: 'job_busy',
  TRANSCRIBER_FAILED: 'transcriber_failed',
  TRANSCRIBER_UNAVAILABLE: 'transcriber_unavailable',
  LLM_FAILED: 'llm_failed',
  VALIDATION_EXHAUSTED: 'validation_exhausted',
  CANCELLED: 'cancelled',
  INTERNAL: 'internal',
};

/** Decode a binary job.create frame -> {header, wav}. Throws on malformed frames. */
export function decodeBinaryJobFrame(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 4) throw new Error('binary frame too short');
  const headerLen = buf.readUInt32BE(0);
  if (headerLen <= 0 || 4 + headerLen > buf.length) throw new Error('bad header length');
  let header;
  try {
    header = JSON.parse(buf.subarray(4, 4 + headerLen).toString('utf8'));
  } catch {
    throw new Error('header is not valid JSON');
  }
  return { header, wav: buf.subarray(4 + headerLen) };
}

/**
 * Parse a RIFF/WAVE header -> {audioFormat, channels, sampleRate, bitsPerSample,
 * dataBytes, durationSec}. Throws on anything that is not a plain PCM WAV.
 */
export function parseWavHeader(buf) {
  if (buf.length < 44) throw new Error('too short to be a WAV');
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('not a RIFF/WAVE file');
  }
  let fmt = null;
  let dataBytes = null;
  let o = 12;
  while (o + 8 <= buf.length) {
    const id = buf.toString('ascii', o, o + 4);
    const size = buf.readUInt32LE(o + 4);
    if (id === 'fmt ' && o + 8 + 16 <= buf.length) {
      fmt = {
        audioFormat: buf.readUInt16LE(o + 8),
        channels: buf.readUInt16LE(o + 10),
        sampleRate: buf.readUInt32LE(o + 12),
        bitsPerSample: buf.readUInt16LE(o + 22),
      };
    } else if (id === 'data') {
      dataBytes = Math.min(size, buf.length - (o + 8));
    }
    o += 8 + size + (size % 2); // chunks are word-aligned
  }
  if (!fmt || dataBytes === null) throw new Error('missing fmt or data chunk');
  const bytesPerSec = fmt.sampleRate * fmt.channels * (fmt.bitsPerSample / 8);
  return { ...fmt, dataBytes, durationSec: bytesPerSec > 0 ? dataBytes / bytesPerSec : 0 };
}
