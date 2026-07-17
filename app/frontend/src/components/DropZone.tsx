// DropZone — the idle screen. One primary action: pick or drop an audio file.
import { useRef, useState } from 'react';
import styles from './DropZone.module.css';

const ACCEPT = '.mp3,.wav,audio/mpeg,audio/wav,audio/x-wav';

export function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const pick = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFile(file);
  };

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Restrudel</h1>
      <p className={styles.tagline}>Turn a snippet of a song into editable Strudel code.</p>
      <div
        className={`${styles.zone} ${dragOver ? styles.dragOver : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pick(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') inputRef.current?.click();
        }}
      >
        <svg className={styles.icon} viewBox="0 0 48 24" aria-hidden="true">
          <path
            d="M2 12h3v-4h3v8h3V4h3v16h3V8h3v12h3V2h3v20h3V6h3v12h3v-8h3v4h3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <button className="btn btn-primary" type="button" tabIndex={-1}>
          Choose audio file
        </button>
        <p className={styles.hint}>or drop it here — mp3 or WAV</p>
      </div>
      <p className={styles.footnote}>
        You'll select a 3–10 second snippet; Restrudel transcribes it and writes a Strudel
        sketch you can play and edit.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
