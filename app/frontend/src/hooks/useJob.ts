// useJob.ts — owns the WebSocket and the lifecycle of the (single) active job.
// Reducer over server messages; exposes createJob / regenerate / cancel.
import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { CodegenMode, HelloMsg, JobCreateHeader, JobResultMsg, ServerMsg } from '../protocol';
import { encodeJobCreate } from '../protocol';
import { ReconnectingSocket, wsUrl, type ConnectionState } from '../lib/ws';

export interface JobState {
  connection: ConnectionState;
  hello: HelloMsg | null;
  jobId: string | null;
  revision: number;
  status: 'idle' | 'queued' | 'transcribing' | 'generating' | 'done' | 'error';
  message: string | null;
  progress: number | null;
  attempt: number | null;
  result: JobResultMsg | null;
  error: { code: string; message: string } | null;
}

const initial: JobState = {
  connection: 'connecting',
  hello: null,
  jobId: null,
  revision: 0,
  status: 'idle',
  message: null,
  progress: null,
  attempt: null,
  result: null,
  error: null,
};

type Action =
  | { kind: 'connection'; state: ConnectionState }
  | { kind: 'server'; msg: ServerMsg }
  | { kind: 'reset' }
  | { kind: 'localError'; code: string; message: string };

function reducer(state: JobState, action: Action): JobState {
  switch (action.kind) {
    case 'connection':
      return { ...state, connection: action.state };
    case 'reset':
      return { ...state, jobId: null, revision: 0, status: 'idle', message: null, progress: null, attempt: null, result: null, error: null };
    case 'localError':
      return { ...state, status: 'error', error: { code: action.code, message: action.message } };
    case 'server': {
      const msg = action.msg;
      switch (msg.type) {
        case 'hello':
          return { ...state, hello: msg };
        case 'job.accepted':
          return { ...state, jobId: msg.jobId, revision: msg.revision, status: msg.status, message: null, progress: null, attempt: null, error: null };
        case 'job.status':
          if (msg.jobId !== state.jobId) return state;
          return {
            ...state,
            revision: msg.revision,
            status: msg.status,
            message: msg.message ?? (msg.status !== state.status ? null : state.message),
            progress: msg.progress ?? null,
            attempt: msg.attempt ?? state.attempt,
          };
        case 'job.result':
          if (msg.jobId !== state.jobId) return state;
          return { ...state, revision: msg.revision, status: 'done', result: msg, message: null, progress: null, attempt: null };
        case 'job.error':
          if (msg.jobId && state.jobId && msg.jobId !== state.jobId) return state;
          return { ...state, status: 'error', error: { code: msg.code, message: msg.message }, message: null, progress: null };
        default:
          return state;
      }
    }
  }
}

export function useJob() {
  const [state, dispatch] = useReducer(reducer, initial);
  const socketRef = useRef<ReconnectingSocket | null>(null);
  const jobIdRef = useRef<string | null>(null);
  jobIdRef.current = state.jobId;

  useEffect(() => {
    const socket = new ReconnectingSocket(wsUrl());
    socket.onMessage = (msg) => dispatch({ kind: 'server', msg });
    socket.onState = (s) => dispatch({ kind: 'connection', state: s });
    socket.onReconnect = () => {
      // reattach to the running/finished job; the server resends its state
      if (jobIdRef.current) socket.send({ type: 'job.subscribe', jobId: jobIdRef.current });
    };
    socket.connect();
    socketRef.current = socket;
    return () => socket.close();
  }, []);

  const createJob = useCallback((header: JobCreateHeader, wav: ArrayBuffer) => {
    const socket = socketRef.current;
    if (!socket?.isOpen) {
      dispatch({ kind: 'localError', code: 'disconnected', message: 'not connected to the server — retrying …' });
      return;
    }
    dispatch({ kind: 'reset' });
    socket.sendBinary(encodeJobCreate(header, wav));
    sessionStorage.setItem('restrudel.lastJobId', header.requestId);
  }, []);

  const regenerate = useCallback((opts: { prompt?: string; bpmOverride?: number; codegen?: CodegenMode }) => {
    const socket = socketRef.current;
    if (!socket?.isOpen || !jobIdRef.current) return;
    socket.send({ type: 'job.regenerate', jobId: jobIdRef.current, requestId: crypto.randomUUID(), ...opts });
  }, []);

  const cancel = useCallback(() => {
    if (jobIdRef.current) socketRef.current?.send({ type: 'job.cancel', jobId: jobIdRef.current });
  }, []);

  const reset = useCallback(() => dispatch({ kind: 'reset' }), []);

  return { state, createJob, regenerate, cancel, reset };
}
