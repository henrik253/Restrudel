// protocol.ts — the WebSocket wire format. Mirror of app/backend/src/protocol.mjs;
// keep the two in sync (the backend's ws_smoke test exercises the format).

// 'cutting' only occurs on the A8 upload path (the server slices the snippet).
export type JobStatus = 'queued' | 'cutting' | 'transcribing' | 'generating' | 'done' | 'error';

export interface NoteEvent {
  onset: number;
  duration: number;
  pitch: number;
  velocity: number;
  channel: 'drums' | 'pitched';
  /** GM program, when the transcriber knows it (the GPU worker does). */
  program?: number;
}

/**
 * How note events become Strudel code:
 *   m2s+polish — MIDI-To-Strudel, then an LLM readability/style pass (default)
 *   m2s        — the tool alone: deterministic, no LLM
 *   llm        — step-grid description straight to the LLM
 */
export type CodegenMode = 'm2s+polish' | 'm2s' | 'llm';

export const CODEGEN_MODES: { value: CodegenMode; label: string; hint: string }[] = [
  { value: 'm2s+polish', label: 'Convert + polish', hint: 'Deterministic conversion, then AI cleanup and your guidance' },
  { value: 'm2s', label: 'Convert only', hint: 'Faithful and fast, no AI — machine-flavoured code' },
  { value: 'llm', label: 'AI from scratch', hint: 'The AI writes the pattern from the note grid' },
];

export interface HelloMsg {
  type: 'hello';
  version: string;
  transcriber: 'mock' | 'local' | 'runpod';
  limits: {
    maxWavBytes: number;
    minSnippetSec: number;
    maxSnippetSec: number;
    maxPromptChars: number;
  };
}

export interface JobAcceptedMsg {
  type: 'job.accepted';
  requestId?: string;
  jobId: string;
  revision: number;
  status: JobStatus;
}

export interface JobStatusMsg {
  type: 'job.status';
  jobId: string;
  revision: number;
  status: JobStatus;
  message?: string;
  progress?: number;
  attempt?: number;
}

export interface JobResultMsg {
  type: 'job.result';
  jobId: string;
  revision: number;
  code: string;
  /** The mode that ACTUALLY ran — differs from the request when polish fell back. */
  codegen: CodegenMode;
  tempoBpm: number;
  events: NoteEvent[];
  describeText?: string;
  attempts?: number;
  llm?: { model: string; source: 'sdk' | 'cli' | 'fake' | 'stub' };
  meta?: {
    codegen?: string;
    requestedMode?: CodegenMode;
    polished?: boolean;
    /** Why polish was skipped, when it was. Worth surfacing: the user asked for it. */
    polishSkipped?: string;
    voiceCount?: number;
    drumVoices?: number;
    validated?: boolean;
  };
  timings: { transcribeMs?: number; generateMs?: number };
}

export interface JobErrorMsg {
  type: 'job.error';
  requestId?: string;
  jobId?: string;
  revision?: number;
  code: string;
  message: string;
}

export type ServerMsg = HelloMsg | JobAcceptedMsg | JobStatusMsg | JobResultMsg | JobErrorMsg;

export interface JobCreateHeader {
  requestId: string;
  prompt?: string;
  codegen?: CodegenMode;
  bpmHint?: number;
  snippet: {
    selStartSec: number;
    selEndSec: number;
    sourceName?: string;
    sourceDurationSec?: number;
  };
}

/** Frame a binary job.create message: [u32 BE header length][JSON header][WAV bytes]. */
export function encodeJobCreate(header: JobCreateHeader, wav: ArrayBuffer): ArrayBuffer {
  const json = new TextEncoder().encode(JSON.stringify({ type: 'job.create', ...header }));
  const frame = new Uint8Array(4 + json.length + wav.byteLength);
  new DataView(frame.buffer).setUint32(0, json.length, false);
  frame.set(json, 4);
  frame.set(new Uint8Array(wav), 4 + json.length);
  return frame.buffer;
}
