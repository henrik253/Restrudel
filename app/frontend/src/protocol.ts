// protocol.ts — the WebSocket wire format. Mirror of app/backend/src/protocol.mjs;
// keep the two in sync (the backend's ws_smoke test exercises the format).

export type JobStatus = 'queued' | 'transcribing' | 'generating' | 'done' | 'error';

export interface NoteEvent {
  onset: number;
  duration: number;
  pitch: number;
  velocity: number;
  channel: 'drums' | 'pitched';
}

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
  tempoBpm: number;
  events: NoteEvent[];
  describeText: string;
  attempts: number;
  llm: { model: string; source: 'sdk' | 'cli' | 'fake' };
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
