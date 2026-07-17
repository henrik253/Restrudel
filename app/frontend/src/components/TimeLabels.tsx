// TimeLabels — start – end · length readout under the waveform. The length
// turns accent-colored at the 3 s / 10 s clamp so the constraint is felt, not
// explained.
import styles from './TimeLabels.module.css';

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, '0')}`;
}

export function TimeLabels({
  start,
  end,
  minLen,
  maxLen,
}: {
  start: number;
  end: number;
  minLen: number;
  maxLen: number;
}) {
  const len = end - start;
  const atClamp = len <= minLen + 0.05 || len >= maxLen - 0.05;
  return (
    <div className={`${styles.labels} mono`}>
      <span>
        {fmt(start)} – {fmt(end)}
      </span>
      <span className={atClamp ? styles.clamped : ''}>{len.toFixed(1)} s</span>
    </div>
  );
}
