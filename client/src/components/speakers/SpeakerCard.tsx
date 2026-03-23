import type { SpeakerState } from '../../types';
import { OnlineIndicator } from './OnlineIndicator';
import styles from './SpeakerCard.module.css';

interface SpeakerCardProps {
  speaker: SpeakerState;
  selected: boolean;
  onToggle: (id: string) => void;
}

const speakerIcon = (model: string) => {
  if (model.toLowerCase().includes('beam')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="8" width="20" height="8" rx="2" />
        <circle cx="7" cy="12" r="2" />
        <circle cx="17" cy="12" r="2" />
      </svg>
    );
  }
  if (model.toLowerCase().includes('sub')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
};

function getStatusLabel(speaker: SpeakerState): string {
  if (!speaker.online) return 'Offline';
  if (speaker.playbackState === 'playing') return 'Playing';
  return 'Idle';
}

export function SpeakerCard({ speaker, selected, onToggle }: SpeakerCardProps) {
  const statusLabel = getStatusLabel(speaker);
  const disabled = !speaker.online;

  return (
    <button
      className={`${styles.card} ${selected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
      onClick={() => !disabled && onToggle(speaker.id)}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${speaker.name} — ${statusLabel}`}
    >
      <div className={styles.icon}>{speakerIcon(speaker.model)}</div>
      <div className={styles.name}>{speaker.name}</div>
      <div className={styles.status}>
        <OnlineIndicator online={speaker.online} />
        <span className={styles.statusLabel}>{statusLabel}</span>
      </div>
      {speaker.online && (
        <div className={styles.volume}>
          <span className={styles.volumeLabel}>Vol {speaker.volume}</span>
        </div>
      )}
    </button>
  );
}
