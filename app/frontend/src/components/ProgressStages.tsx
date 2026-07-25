// ProgressStages — honest staged progress. Slow paths (CPU transcription,
// LLM retries) must look intentional, so each stage narrates what it is doing.
import type { JobState } from '../hooks/useJob';
import styles from './ProgressStages.module.css';

const STAGES = [
  // 'cutting' is the server slicing the selection out of the uploaded track;
  // it is fast, but showing it keeps the stage list honest about what runs.
  { key: 'cutting', label: 'Cutting the snippet' },
  { key: 'transcribing', label: 'Transcribing audio' },
  { key: 'generating', label: 'Writing Strudel code' },
] as const;

export function ProgressStages({
  job,
  transcriber,
  onCancel,
}: {
  job: JobState;
  transcriber: string | undefined;
  onCancel: () => void;
}) {
  const activeIndex = STAGES.findIndex((s) => s.key === job.status);

  return (
    <div className={styles.wrap}>
      {job.status === 'queued' && (
        <p className={styles.queued}>
          <span className="spinner" /> Waiting for a free slot …
        </p>
      )}
      <ol className={styles.stages}>
        {STAGES.map((stage, i) => {
          const state = activeIndex === -1 ? 'pending' : i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending';
          return (
            <li key={stage.key} className={styles[state]}>
              <span className={styles.marker}>
                {state === 'done' ? '✓' : state === 'active' ? <span className="spinner" /> : '·'}
              </span>
              <div>
                <span className={styles.label}>{stage.label}</span>
                {state === 'active' && (
                  <p className={styles.message}>
                    {job.message ??
                      (stage.key === 'transcribing' && transcriber === 'local'
                        ? 'running the model on CPU — this can take a minute or two'
                        : '…')}
                    {job.progress != null && ` (${Math.round(job.progress * 100)}%)`}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <button className="btn btn-ghost" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
