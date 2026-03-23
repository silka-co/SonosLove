import { api } from '../../services/api';
import styles from './TransportControls.module.css';

interface TransportControlsProps {
  isPlaying: boolean;
  speakerId?: string;
}

export function TransportControls({ isPlaying, speakerId }: TransportControlsProps) {
  const handlePrev = () => api.prev(speakerId).catch(console.error);
  const handlePlayPause = () =>
    (isPlaying ? api.pause(speakerId) : api.play(speakerId)).catch(console.error);
  const handleNext = () => api.next(speakerId).catch(console.error);

  return (
    <div className={styles.controls}>
      <button className={styles.secondary} onClick={handlePrev} aria-label="Previous track">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
        </svg>
      </button>

      <button className={styles.primary} onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <button className={styles.secondary} onClick={handleNext} aria-label="Next track">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>
    </div>
  );
}
