// ResultView — the generated Strudel sketch in a playable editor, with copy,
// regenerate-with-guidance (LLM only, no re-transcription) and a details
// disclosure (BPM override, transcription grid, timings).
import { useEffect, useRef, useState } from 'react';
import type { JobState } from '../hooks/useJob';
import { StrudelRepl, type StrudelReplHandle } from './StrudelRepl';
import type { CodegenMode, JobResultMsg } from '../protocol';
import styles from './ResultView.module.css';

const MODE_LABELS: Record<CodegenMode, string> = {
  'm2s+polish': 'converted + polished',
  m2s: 'converted',
  llm: 'written by AI',
};

/** One honest sentence about which checkpoint transcribed the snippet —
 *  and whether the genre classifier or a manual override picked it. */
function modelLine(t: NonNullable<JobResultMsg['transcriber']>): string | null {
  const version = t.modelVersion ? ` (${t.modelVersion})` : '';
  if (t.modelChoice === 'base' || t.modelChoice === 'finetuned') {
    return `model: ${t.modelChoice === 'base' ? 'base' : 'fine-tuned'}${version} — manual override`;
  }
  const c = t.classifier;
  if (c?.error) {
    return `model: fine-tuned${version} — classifier unavailable, fell back (${c.error.slice(0, 80)})`;
  }
  if (c) {
    const pct = c.predictedClass && c.probs?.[c.predictedClass] !== undefined
      ? ` ${Math.round(c.probs[c.predictedClass] * 100)} %`
      : '';
    const heard = c.predictedClass ? ` — heard ${c.predictedClass.replace(/_/g, ' ')}${pct}` : '';
    return `model: ${c.route === 'base' ? 'base' : 'fine-tuned'}${version} — picked by the genre classifier${heard}`;
  }
  return t.modelVersion ? `model: ${t.modelVersion} (server default)` : null;
}

interface Props {
  job: JobState;
  onRegenerate: (opts: { prompt?: string; bpmOverride?: number; codegen?: CodegenMode }) => void;
  /** Convert the CURRENT waveform selection again (the selection stays live above). */
  onTransform: () => void;
  transformBusy: boolean;
  maxPromptChars: number;
}

export function ResultView({ job, onRegenerate, onTransform, transformBusy, maxPromptChars }: Props) {
  const result = job.result!;
  const regenerating = job.status === 'generating' || job.status === 'queued';
  const [prompt, setPrompt] = useState('');
  const [bpm, setBpm] = useState<number>(result.tempoBpm);
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const replRef = useRef<StrudelReplHandle>(null);
  // Debug analytics: the unenhanced (pre-polish) code gets its own player.
  const [rawPlaying, setRawPlaying] = useState(false);
  const rawReplRef = useRef<StrudelReplHandle>(null);

  // a fresh result resets the local refine state
  useEffect(() => {
    setBpm(result.tempoBpm);
    setCopied(false);
  }, [result]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.code);
    } catch {
      // clipboard API unavailable/denied — legacy fallback
      const ta = document.createElement('textarea');
      ta.value = result.code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <h2>Strudel sketch</h2>
        <span className={`${styles.meta} mono`}>
          {result.tempoBpm} bpm · {MODE_LABELS[result.codegen] ?? result.codegen}
          {result.llm ? ` · ${result.llm.model}` : ''}
        </span>
      </header>

      {result.meta?.polishSkipped && (
        <p className={styles.notice}>
          The AI polish step was skipped — you're seeing the direct conversion.{' '}
          <span className="mono">{result.meta.polishSkipped}</span>
        </p>
      )}

      <StrudelRepl ref={replRef} code={result.code} onPlayingChange={setPlaying} />
      <p className={styles.playHint}>Edit the code live — it's yours now.</p>

      <div className={styles.actions}>
        <button className="btn btn-primary" onClick={() => replRef.current?.toggle()}>
          {playing ? '◼ Stop' : '▶ Play'}
        </button>
        <button className="btn btn-secondary" onClick={copy}>
          {copied ? '✓ Copied' : 'Copy code'}
        </button>
        {/* The waveform above stays live: adjust or replay the selection and
            transform it again — replaces the old "New selection" reset. */}
        <button className="btn btn-ghost" onClick={onTransform} disabled={regenerating || transformBusy}>
          {transformBusy ? (
            <>
              <span className="spinner" /> Preparing …
            </>
          ) : (
            '↻ Transform selection'
          )}
        </button>
      </div>

      <details className={`disclosure ${styles.refine}`}>
        <summary>Refine — guidance &amp; BPM</summary>
        <div className={styles.refineBody}>
          <textarea
            value={prompt}
            maxLength={maxPromptChars}
            placeholder='Tell the model what to change — e.g. "grittier bass, half-time hats"'
            onChange={(e) => setPrompt(e.target.value)}
            disabled={regenerating}
          />
          <div className={styles.refineRow}>
            <label className={styles.bpm}>
              BPM
              <input
                type="number"
                min={40}
                max={260}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                disabled={regenerating}
              />
            </label>
            <button
              className="btn btn-secondary"
              disabled={regenerating}
              onClick={() =>
                onRegenerate({
                  prompt: prompt || undefined,
                  bpmOverride: bpm !== result.tempoBpm ? bpm : undefined,
                })
              }
            >
              {regenerating ? (
                <>
                  <span className="spinner" /> Rewriting …
                </>
              ) : (
                'Regenerate'
              )}
            </button>
            <span className={styles.refineHint}>
              Reuses the transcription — only the code is rewritten, so this is fast.
            </span>
          </div>
        </div>
      </details>

      <details className={`disclosure ${styles.details}`}>
        <summary>Details</summary>
        <div className={styles.detailsBody}>
          <p className="mono">
            {result.events.length} note events · transcribed in{' '}
            {((result.timings.transcribeMs ?? 0) / 1000).toFixed(1)} s · code written in{' '}
            {((result.timings.generateMs ?? 0) / 1000).toFixed(1)} s
            {result.llm ? ` (${result.llm.source})` : ''}
            {result.meta?.voiceCount ? ` · ${result.meta.voiceCount} voices` : ''}
          </p>
          {result.transcriber && modelLine(result.transcriber) && (
            <p className="mono">{modelLine(result.transcriber)}</p>
          )}
          {result.describeText && <pre className="mono">{result.describeText}</pre>}

          {/* Debug/beta: the pre-polish tool output, playable — shows whether
              the AI polish actually changed anything. */}
          {result.rawCode && (
            <details className="disclosure">
              <summary>Advanced analytics — unenhanced code</summary>
              <div className={styles.detailsBody}>
                <p className={styles.notice}>
                  {result.rawCode === result.code
                    ? 'Identical to the final code — the AI made no changes.'
                    : 'The AI changed this code — compare by playing both versions.'}
                </p>
                <StrudelRepl ref={rawReplRef} code={result.rawCode} onPlayingChange={setRawPlaying} />
                <button className="btn btn-secondary" onClick={() => rawReplRef.current?.toggle()}>
                  {rawPlaying ? '◼ Stop' : '▶ Play unenhanced version'}
                </button>
              </div>
            </details>
          )}
        </div>
      </details>
    </section>
  );
}
