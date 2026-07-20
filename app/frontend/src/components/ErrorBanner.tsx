// ErrorBanner — one consistent place for problems, in plain language.
import styles from './ErrorBanner.module.css';

const FRIENDLY: Record<string, string> = {
  disconnected: 'Lost the connection to the server — reconnecting …',
  payload_too_large: 'That selection is too large to send. Try a shorter snippet.',
  invalid_wav: 'The audio could not be prepared for the model. Try a different file.',
  snippet_out_of_range: 'The selection must be between 3 and 10 seconds.',
  prompt_too_long: 'The guidance prompt is too long (2000 characters max).',
  job_not_found: 'This job has expired on the server. Convert the selection again.',
  job_busy: 'A conversion is already running — wait for it to finish.',
  transcriber_failed: 'Nothing transcribable came out of this selection. Try a clearer or longer snippet.',
  transcriber_unavailable: 'The transcription engine is not available right now.',
  llm_failed: 'The code-writing model could not be reached. Try again.',
  validation_exhausted:
    'The model could not produce valid Strudel code for this snippet. Try a different selection, or add a guidance prompt.',
  cancelled: 'Conversion cancelled.',
};

export function ErrorBanner({
  code,
  message,
  onDismiss,
}: {
  code: string;
  message: string;
  onDismiss: () => void;
}) {
  const friendly = FRIENDLY[code];
  return (
    <div className={styles.banner} role="alert">
      <span>
        {friendly ?? 'Something went wrong.'}
        {!friendly && message ? <span className={styles.detail}> {message}</span> : null}
      </span>
      <button className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
