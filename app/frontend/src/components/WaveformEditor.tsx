// WaveformEditor — the hero: waveform with one draggable/resizable region,
// clamped to 3-10 s, with looped playback of the selection (button + space).
import { useCallback, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin, { type Region } from 'wavesurfer.js/plugins/regions';
import { useSpacebarPlay } from '../hooks/useSpacebarPlay';
import styles from './WaveformEditor.module.css';

export interface Selection {
  start: number;
  end: number;
}

interface Props {
  file: File;
  minLen: number;
  maxLen: number;
  /** interactive & playable; false while converting / showing the result */
  active: boolean;
  onReady: (buffer: AudioBuffer, duration: number) => void;
  onDecodeError: () => void;
  onSelectionChange: (sel: Selection) => void;
}

export function WaveformEditor({ file, minLen, maxLen, active, onReady, onDecodeError, onSelectionChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const regionRef = useRef<Region | null>(null);
  const prevBoundsRef = useRef<Selection>({ start: 0, end: 0 });
  const playingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [zoom, setZoom] = useState(0); // 0 = fit, 1 = max
  const [clampFlash, setClampFlash] = useState(false);

  // latest callbacks without re-creating wavesurfer
  const cbRef = useRef({ onReady, onDecodeError, onSelectionChange });
  cbRef.current = { onReady, onDecodeError, onSelectionChange };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ws = WaveSurfer.create({
      container,
      height: 132,
      waveColor: '#39414d',
      progressColor: '#39414d', // no progress dye: the region is the focus
      cursorColor: 'rgba(232, 234, 237, 0.6)',
      cursorWidth: 1,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      normalize: true,
      interact: false, // clicking never seeks; the region is the only control
      autoScroll: true,
      autoCenter: true,
    });
    const regions = ws.registerPlugin(RegionsPlugin.create());
    wsRef.current = ws;

    const clampRegion = (region: Region) => {
      const len = region.end - region.start;
      if (len >= minLen - 1e-3 && len <= maxLen + 1e-3) return;
      const prev = prevBoundsRef.current;
      const target = Math.min(maxLen, Math.max(minLen, len));
      const startMoved = Math.abs(region.start - prev.start) > Math.abs(region.end - prev.end);
      let { start, end } = region;
      if (startMoved) start = end - target;
      else end = start + target;
      if (start < 0) {
        start = 0;
        end = target;
      }
      const total = ws.getDuration();
      if (end > total) {
        end = total;
        start = Math.max(0, end - target);
      }
      region.setOptions({ start, end });
      setClampFlash(true);
      window.setTimeout(() => setClampFlash(false), 350);
    };

    const publish = (region: Region) => {
      prevBoundsRef.current = { start: region.start, end: region.end };
      cbRef.current.onSelectionChange({ start: region.start, end: region.end });
    };

    ws.on('decode', (dur) => {
      const buffer = ws.getDecodedData();
      if (!buffer) return;
      setDuration(dur);
      cbRef.current.onReady(buffer, dur);
      if (dur < minLen) return; // App rejects the file; no region
      const end = Math.min(maxLen, dur); // default to the full 10 s window
      const region = regions.addRegion({
        id: 'selection',
        start: 0,
        end,
        color: 'rgba(239, 131, 84, 0.18)',
        drag: true,
        resize: true,
        minLength: minLen,
        maxLength: Math.min(maxLen, dur),
      });
      regionRef.current = region;
      publish(region);
    });

    ws.on('error', () => cbRef.current.onDecodeError());

    // live labels while dragging; clamp + publish when the interaction ends
    regions.on('region-update', (region) => {
      cbRef.current.onSelectionChange({ start: region.start, end: region.end });
    });
    regions.on('region-updated', (region) => {
      clampRegion(region);
      publish(region);
      if (playingRef.current) ws.setTime(region.start);
    });

    // loop: when the playhead leaves the region, jump back to its start
    regions.on('region-out', (region) => {
      if (playingRef.current) ws.setTime(region.start);
    });
    ws.on('finish', () => {
      const region = regionRef.current;
      if (playingRef.current && region) {
        ws.setTime(region.start);
        void ws.play();
      }
    });

    void ws.loadBlob(file);

    return () => {
      playingRef.current = false;
      regionRef.current = null;
      ws.destroy();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const stop = useCallback(() => {
    const ws = wsRef.current;
    playingRef.current = false;
    setPlaying(false);
    ws?.pause();
    if (regionRef.current) ws?.setTime(regionRef.current.start);
  }, []);

  const toggle = useCallback(() => {
    const ws = wsRef.current;
    const region = regionRef.current;
    if (!ws || !region) return;
    if (playingRef.current) {
      stop();
    } else {
      playingRef.current = true;
      setPlaying(true);
      ws.setTime(region.start);
      ws.play().catch(() => {
        // autoplay blocked or device error — don't lie about playing
        playingRef.current = false;
        setPlaying(false);
      });
    }
  }, [stop]);

  useSpacebarPlay(toggle, active);

  // leaving the interactive state (convert clicked, result shown) stops playback
  useEffect(() => {
    if (!active) stop();
  }, [active, stop]);

  const applyZoom = (v: number) => {
    setZoom(v);
    const ws = wsRef.current;
    const container = containerRef.current;
    if (!ws || !container || !duration) return;
    const fit = container.clientWidth / duration;
    ws.zoom(fit + (200 - fit) * v * v); // quadratic: fine control at low zoom
  };

  return (
    <div className={`${styles.wrap} ${active ? '' : styles.dimmed} ${clampFlash ? styles.flash : ''}`}>
      <div ref={containerRef} className={styles.waveform} />
      <div className={styles.controls}>
        <button
          className="btn btn-secondary"
          onClick={toggle}
          disabled={!active || !duration}
          aria-label={playing ? 'Stop' : 'Play selection'}
        >
          {playing ? '◼ Stop' : '▶ Play selection'}
        </button>
        <span className={styles.spaceHint}>space</span>
        {duration > 20 && (
          <label className={styles.zoom}>
            <span>zoom</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={zoom}
              disabled={!active}
              onChange={(e) => applyZoom(Number(e.target.value))}
            />
          </label>
        )}
      </div>
    </div>
  );
}
