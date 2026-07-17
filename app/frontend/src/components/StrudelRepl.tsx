// StrudelRepl — the embedded <strudel-editor> web component (@strudel/repl),
// lazy-loaded so the heavy bundle (CodeMirror + superdough) only downloads
// when a result exists. The component inserts its editor as a SIBLING of the
// custom element, so both live inside a wrapper div we own and clear on
// unmount. Code updates go through the observed `code` attribute; playback is
// exposed imperatively (the bare component has no play button of its own).
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from './StrudelRepl.module.css';

interface StrudelEditorElement extends HTMLElement {
  editor?: {
    setCode: (code: string) => void;
    toggle?: () => Promise<void>;
    stop?: () => Promise<void>;
  };
}

export interface StrudelReplHandle {
  toggle: () => void;
  stop: () => void;
}

interface Props {
  code: string;
  /** Fires with the editor's started state (play/stop, incl. ctrl+enter). */
  onPlayingChange?: (playing: boolean) => void;
}

export const StrudelRepl = forwardRef<StrudelReplHandle, Props>(function StrudelRepl(
  { code, onPlayingChange },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const elRef = useRef<StrudelEditorElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const cbRef = useRef(onPlayingChange);
  cbRef.current = onPlayingChange;

  useImperativeHandle(ref, () => ({
    toggle: () => void elRef.current?.editor?.toggle?.(),
    stop: () => void elRef.current?.editor?.stop?.(),
  }));

  useEffect(() => {
    let cancelled = false;
    const wrap = wrapRef.current;
    if (!wrap) return;

    import('@strudel/repl')
      .then(() => {
        if (cancelled || !wrapRef.current) return;
        const el = document.createElement('strudel-editor') as StrudelEditorElement;
        el.setAttribute('code', code);
        el.addEventListener('update', (e) => {
          const state = (e as CustomEvent).detail;
          if (state && typeof state.started === 'boolean') cbRef.current?.(state.started);
        });
        wrapRef.current.appendChild(el);
        elRef.current = el;
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      try {
        void elRef.current?.editor?.stop?.();
      } catch {
        // best effort — the audio context may already be gone
      }
      elRef.current = null;
      if (wrap) wrap.innerHTML = '';
    };
    // mount once; code updates handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    elRef.current?.setAttribute('code', code);
  }, [code]);

  if (failed) {
    return (
      <div className={styles.fallback}>
        <p>The embedded editor could not load. Your code:</p>
        <pre className="mono">{code}</pre>
        <a
          className="btn btn-secondary"
          href={`https://strudel.cc/#${btoa(unescape(encodeURIComponent(code)))}`}
          target="_blank"
          rel="noreferrer"
        >
          Open in strudel.cc ↗
        </a>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {loading && (
        <p className={styles.loading}>
          <span className="spinner" /> Loading the Strudel editor …
        </p>
      )}
      <div ref={wrapRef} className={styles.editor} />
    </div>
  );
});
