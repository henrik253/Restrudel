// DropZone — the idle screen. One primary action: pick or drop an audio file;
// example tracks below it let you try the app without a file of your own.
import { useRef, useState } from 'react';
import { EXAMPLE_SONGS, type ExampleSong } from '../examples';
import styles from './DropZone.module.css';

const ACCEPT = '.mp3,.wav,audio/mpeg,audio/wav,audio/x-wav';

export function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const pick = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFile(file);
  };

  const loadExample = async (song: ExampleSong) => {
    if (loadingId) return;
    setLoadingId(song.id);
    setLoadError(null);
    try {
      const resp = await fetch(song.url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      onFile(new File([blob], song.fileName, { type: blob.type || 'audio/mpeg' }));
    } catch {
      setLoadError(`Couldn't load ${song.title}. Try again, or choose your own file.`);
      setLoadingId(null);
    }
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

      <div className={styles.examples}>
        <span className={styles.examplesLabel}>No file handy? Try an example</span>
        <div className={styles.exampleList}>
          {EXAMPLE_SONGS.map((song) => (
            <button
              key={song.id}
              type="button"
              className={styles.exampleChip}
              onClick={() => loadExample(song)}
              disabled={loadingId !== null}
            >
              {loadingId === song.id ? <span className="spinner" /> : <span className={styles.play}>▶</span>}
              <span className={styles.exampleTitle}>{song.title}</span>
              <span className={styles.exampleArtist}>{song.artist}</span>
            </button>
          ))}
        </div>
        {loadError && <p className={styles.loadError}>{loadError}</p>}
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
