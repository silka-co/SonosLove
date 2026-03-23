import { useState, useRef, useCallback } from 'react';
import { api } from '../../services/api';
import styles from './VolumeSlider.module.css';

interface VolumeSliderProps {
  volume: number;
  speakerId: string;
}

export function VolumeSlider({ volume, speakerId }: VolumeSliderProps) {
  const [localVolume, setLocalVolume] = useState(volume);
  const [isDragging, setIsDragging] = useState(false);
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show server volume when not dragging
  const displayVolume = isDragging ? localVolume : volume;

  const sendVolume = useCallback(
    (vol: number) => {
      if (throttleRef.current) return;
      throttleRef.current = setTimeout(() => {
        throttleRef.current = null;
      }, 200);
      api.setVolume(speakerId, vol).catch(console.error);
    },
    [speakerId],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLocalVolume(val);
    sendVolume(val);
  };

  return (
    <div className={styles.container}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.icon}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      </svg>
      <input
        type="range"
        min="0"
        max="100"
        value={displayVolume}
        onChange={handleChange}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        className={styles.slider}
        aria-label={`Volume: ${displayVolume}%`}
        style={{ '--fill': `${displayVolume}%` } as React.CSSProperties}
      />
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.icon}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    </div>
  );
}
