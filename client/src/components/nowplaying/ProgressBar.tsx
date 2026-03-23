import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  positionSeconds: number;
  durationSeconds: number;
  onSeek?: (seconds: number) => void;
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ProgressBar({ positionSeconds, durationSeconds, onSeek }: ProgressBarProps) {
  const percent = durationSeconds > 0 ? (positionSeconds / durationSeconds) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || durationSeconds <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.floor(ratio * durationSeconds));
  };

  return (
    <div className={styles.container}>
      <div className={styles.track} onClick={handleClick} role="slider" aria-valuenow={positionSeconds} aria-valuemax={durationSeconds}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      <div className={styles.times}>
        <span>{formatTime(positionSeconds)}</span>
        <span>{durationSeconds > 0 ? formatTime(durationSeconds) : '--:--'}</span>
      </div>
    </div>
  );
}
