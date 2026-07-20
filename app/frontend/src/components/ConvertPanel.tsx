// ConvertPanel — the single primary action of the loaded state, with the
// guidance prompt tucked behind a disclosure (progressive disclosure: most
// conversions need no prompt).
import styles from './ConvertPanel.module.css';

interface Props {
  prompt: string;
  onPromptChange: (v: string) => void;
  onConvert: () => void;
  disabled: boolean;
  busy: boolean;
  maxPromptChars: number;
}

export function ConvertPanel({ prompt, onPromptChange, onConvert, disabled, busy, maxPromptChars }: Props) {
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
      <details className="disclosure">
        <summary>Add guidance (optional)</summary>
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
        </div>
      </details>
    </div>
  );
}
