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

/**
 * Debug/beta: which transcription checkpoint the GPU worker loads.
 *   auto      — the worker's genre classifier routes the snippet (A10)
 *   finetuned — the deployed fine-tuned checkpoint (v2mix)
 *   base      — the released base YourMT3+ (acoustic specialist)
 */
export type ModelChoice = 'auto' | 'finetuned' | 'base';

export const MODEL_CHOICES: { value: ModelChoice; label: string; hint: string }[] = [
  { value: 'auto', label: 'Auto', hint: 'A genre classifier picks base or fine-tuned per snippet' },
  { value: 'finetuned', label: 'Fine-tuned (v2mix)', hint: 'Trained on synth timbres — best for electronic music' },
  { value: 'base', label: 'Base YourMT3+', hint: 'The stock model — best for acoustic/classical material' },
];

/**
 * The genre router's verdict for an 'auto' job. Routing is a tau rule, not
 * argmax: base wins only when P(classic) + P(acoustic_band) > tau.
 */
export interface ClassifierDecision {
  route: 'finetuned' | 'base';
  /** argmax class, e.g. 'electronic' — what the router heard. */
  predictedClass?: string;
  probs?: Record<string, number>;
  /** P(classic) + P(acoustic_band), compared against tau. */
  pBase?: number;
  tau?: number;
  crops?: number;
  /** Present when the router could not run (e.g. base checkpoint missing). */
  error?: string;
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
  /** Pre-polish tool output (absent for the pure-LLM path) — debug analytics. */
  rawCode?: string;
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
  /** Which transcriber/checkpoint actually processed the snippet. */
  transcriber?: {
    adapter?: string;
    modelVersion?: string | null;
    modelChoice?: ModelChoice;
    /** Present on 'auto' jobs when the transcriber ran the genre router. */
    classifier?: ClassifierDecision;
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
  /** Debug/beta: transcription model override. */
  model?: ModelChoice;
  /** Debug/beta: target peak (dBFS, −24…0) for snippet normalization; default −1. */
  peakDb?: number;
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
