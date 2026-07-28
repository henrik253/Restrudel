// ConvertPanel — the single primary action of the loaded state, with the
// guidance prompt and codegen mode tucked behind a disclosure (progressive
// disclosure: most conversions need neither). Debug/beta switches live in a
// SEPARATE "Developer" disclosure so they never mix with normal options.
import { CODEGEN_MODES, MODEL_CHOICES, type CodegenMode, type ModelChoice } from '../protocol';
import styles from './ConvertPanel.module.css';

interface Props {
  prompt: string;
  onPromptChange: (v: string) => void;
  codegen: CodegenMode;
  onCodegenChange: (v: CodegenMode) => void;
  model: ModelChoice;
  onModelChange: (v: ModelChoice) => void;
  onConvert: () => void;
  disabled: boolean;
  busy: boolean;
  /** 0–1 while the track uploads, null when idle or done. */
  uploadProgress: number | null;
  maxPromptChars: number;
}

export function ConvertPanel({
  prompt, onPromptChange, codegen, onCodegenChange, model, onModelChange, onConvert, disabled, busy,
  uploadProgress, maxPromptChars,
}: Props) {
  return (
    <div className={styles.panel}>
      <button className="btn btn-primary" onClick={onConvert} disabled={disabled || busy}>
        {busy ? (
          <>
            <span className="spinner" /> Preparing audio …
          </>
        ) : (
          'Convert selection'
        )}
      </button>
      {uploadProgress !== null && (
        <p className={styles.uploadHint}>
          Uploading the track … {Math.round(uploadProgress * 100)}%
          <span> — you can pick a selection meanwhile</span>
        </p>
      )}
      <details className="disclosure">
        <summary>Options (optional)</summary>
        <div className={styles.promptBox}>
          <textarea
            value={prompt}
            maxLength={maxPromptChars}
            placeholder='Steer the sound of the generated code — e.g. "darker pads, more 909, dubby delay"'
            onChange={(e) => onPromptChange(e.target.value)}
          />
          <p className={styles.promptHint}>
            Passed to the model that writes the Strudel code. It shapes sound design and style —
            the rhythm always comes from your snippet.
          </p>

          <fieldset className={styles.modes}>
            <legend>How to write the code</legend>
            {CODEGEN_MODES.map((m) => (
              <label key={m.value} className={styles.mode}>
                <input
                  type="radio"
                  name="codegen"
                  value={m.value}
                  checked={codegen === m.value}
                  onChange={() => onCodegenChange(m.value)}
                />
                <span>
                  <strong>{m.label}</strong>
                  <em>{m.hint}</em>
                </span>
              </label>
            ))}
          </fieldset>
        </div>
      </details>

      {/* Debug/beta switches — deliberately separate from normal Options. */}
      <details className="disclosure">
        <summary>Developer (beta)</summary>
        <div className={styles.promptBox}>
          <fieldset className={styles.modes}>
            <legend>Transcription model</legend>
            {MODEL_CHOICES.map((m) => (
              <label key={m.value} className={styles.mode}>
                <input
                  type="radio"
                  name="model"
                  value={m.value}
                  checked={model === m.value}
                  onChange={() => onModelChange(m.value)}
                />
                <span>
                  <strong>{m.label}</strong>
                  <em>{m.hint}</em>
                </span>
              </label>
            ))}
          </fieldset>
          <p className={styles.promptHint}>
            Debug options for the beta — they change how the pipeline runs, not the music.
          </p>
        </div>
      </details>
    </div>
  );
}
