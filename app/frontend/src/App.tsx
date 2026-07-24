// App — the state machine: idle -> loaded -> converting -> result. The
// waveform stays mounted (dimmed) through converting/result so "adjust the
// selection and reconvert" is always one step away.
import { useCallback, useMemo, useState } from 'react';
import styles from './App.module.css';
import { ConvertPanel } from './components/ConvertPanel';
import type { CodegenMode } from './protocol';
import { uploadTrack, type UploadResult } from './lib/upload';
import { DropZone } from './components/DropZone';
import { ErrorBanner } from './components/ErrorBanner';
import { ProgressStages } from './components/ProgressStages';
import { ResultView } from './components/ResultView';
import { TimeLabels } from './components/TimeLabels';
import { WaveformEditor, type Selection } from './components/WaveformEditor';
import { useJob } from './hooks/useJob';
import { sliceAndResample, TARGET_SAMPLE_RATE } from './lib/audio';
import { encodeWavPcm16Mono } from './lib/wav';

type LocalError = { code: string; message: string } | null;

export default function App() {
  const { state: job, createJob, createJobFromUpload, regenerate, cancel, reset } = useJob();
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 10 });
  const [prompt, setPrompt] = useState('');
  const [codegen, setCodegen] = useState<CodegenMode>('m2s+polish');
  const [localError, setLocalError] = useState<LocalError>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [preparing, setPreparing] = useState(false);
  // A8: the whole track goes to the backend as soon as it is picked, so every
  // later selection is just a time range.
  const [upload, setUpload] = useState<UploadResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const limits = job.hello?.limits ?? {
    minSnippetSec: 3,
    maxSnippetSec: 10,
    maxPromptChars: 2000,
    maxWavBytes: 700_000,
  };

  const mode = useMemo(() => {
    if (!file) return 'idle' as const;
    if (job.result) return 'result' as const;
    if (job.status === 'queued' || job.status === 'transcribing' || job.status === 'generating') {
      return 'converting' as const;
    }
    return 'loaded' as const;
  }, [file, job.result, job.status]);

  const error = localError ?? (job.error && !errorDismissed ? job.error : null);

  const onFile = useCallback(
    (f: File) => {
      setLocalError(null);
      setErrorDismissed(false);
      setAudioBuffer(null);
      setUpload(null);
      reset();
      setFile(f);

      // Upload while the user is still looking at the waveform: by the time
      // they have chosen a range, the track is usually already on the server.
      setUploadProgress(0);
      uploadTrack(f, { onProgress: setUploadProgress })
        .then((res) => {
          setUpload(res);
          setUploadProgress(null);
        })
        .catch((e) => {
          setUploadProgress(null);
          // Not fatal: convert() falls back to cutting in the browser.
          if (e?.code !== 'cancelled') {
            console.warn('upload failed, falling back to client-side cutting:', e);
          }
        });
    },
    [reset],
  );

  const onWaveReady = useCallback(
    (buffer: AudioBuffer, duration: number) => {
      if (duration < limits.minSnippetSec) {
        setFile(null);
        setLocalError({
          code: 'file_too_short',
          message: `That file is only ${duration.toFixed(1)} s — it needs at least ${limits.minSnippetSec} s.`,
        });
        return;
      }
      setAudioBuffer(buffer);
    },
    [limits.minSnippetSec],
  );

  const onDecodeError = useCallback(() => {
    setFile(null);
    setLocalError({ code: 'decode_failed', message: "Couldn't read this file — is it an mp3 or WAV?" });
  }, []);

  const convert = useCallback(async () => {
    if (!audioBuffer || !file) return;
    setLocalError(null);
    setErrorDismissed(false);

    // Preferred path: the server already has the track — send just the range.
    if (upload) {
      createJobFromUpload({
        requestId: crypto.randomUUID(),
        uploadId: upload.uploadId,
        prompt: prompt || undefined,
        codegen,
        snippet: { selStartSec: selection.start, selEndSec: selection.end },
      });
      return;
    }

    // Fallback (upload still running or failed): cut in the browser as before.
    setPreparing(true);
    try {
      const samples = await sliceAndResample(audioBuffer, selection.start, selection.end);
      const wav = encodeWavPcm16Mono(samples, TARGET_SAMPLE_RATE);
      if (wav.byteLength > limits.maxWavBytes) {
        setLocalError({ code: 'payload_too_large', message: '' });
        return;
      }
      createJob(
        {
          requestId: crypto.randomUUID(),
          prompt: prompt || undefined,
          codegen,
          snippet: {
            selStartSec: selection.start,
            selEndSec: selection.end,
            sourceName: file.name,
            sourceDurationSec: audioBuffer.duration,
          },
        },
        wav,
      );
    } catch {
      setLocalError({ code: 'prepare_failed', message: 'Could not prepare the audio snippet.' });
    } finally {
      setPreparing(false);
    }
  }, [audioBuffer, file, selection, prompt, codegen, upload, limits.maxWavBytes, createJob, createJobFromUpload]);

  const newSelection = useCallback(() => {
    reset();
    setErrorDismissed(false);
  }, [reset]);

  const replaceFile = useCallback(() => {
    setFile(null);
    setAudioBuffer(null);
    setUpload(null);
    reset();
  }, [reset]);

  if (mode === 'idle') {
    return (
      <main className={styles.page}>
        {error && (
          <div className={styles.idleError}>
            <ErrorBanner code={error.code} message={error.message} onDismiss={() => { setLocalError(null); setErrorDismissed(true); }} />
          </div>
        )}
        <DropZone onFile={onFile} />
        <footer className={styles.footer}>
          <span>sketch generator — the output is a starting point to edit, not a transcription</span>
        </footer>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span className={styles.wordmark}>Restrudel</span>
        <div className={styles.fileInfo}>
          {job.connection !== 'open' && <span className={styles.reconnect}>reconnecting …</span>}
          <span className={styles.fileName}>{file!.name}</span>
          <button className="btn btn-ghost" onClick={replaceFile}>
            Replace file
          </button>
        </div>
      </header>

      {error && (
        <ErrorBanner
          code={error.code}
          message={error.message}
          onDismiss={() => {
            setLocalError(null);
            setErrorDismissed(true);
          }}
        />
      )}

      <WaveformEditor
        file={file!}
        minLen={limits.minSnippetSec}
        maxLen={limits.maxSnippetSec}
        active={mode === 'loaded'}
        onReady={onWaveReady}
        onDecodeError={onDecodeError}
        onSelectionChange={setSelection}
      />
      <TimeLabels
        start={selection.start}
        end={selection.end}
        minLen={limits.minSnippetSec}
        maxLen={limits.maxSnippetSec}
      />

      {mode === 'loaded' && (
        <ConvertPanel
          prompt={prompt}
          onPromptChange={setPrompt}
          codegen={codegen}
          onCodegenChange={setCodegen}
          onConvert={convert}
          disabled={!audioBuffer || job.connection !== 'open'}
          busy={preparing}
          uploadProgress={uploadProgress}
          maxPromptChars={limits.maxPromptChars}
        />
      )}

      {mode === 'converting' && (
        <ProgressStages job={job} transcriber={job.hello?.transcriber} onCancel={cancel} />
      )}

      {mode === 'result' && (
        <ResultView
          job={job}
          onRegenerate={(opts) => {
            setErrorDismissed(false);
            regenerate(opts);
          }}
          onNewSelection={newSelection}
          maxPromptChars={limits.maxPromptChars}
        />
      )}
    </main>
  );
}
