import type { SpeakerState } from '../../types';
import { OnlineIndicator } from './OnlineIndicator';
import styles from './SpeakerRow.module.css';

interface SpeakerRowProps {
  speaker: SpeakerState;
  selected: boolean;
  loading: boolean;
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

const CheckMark = () => (
  <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="currentColor" />
    <path
      d="M7.5 12.5L10.5 15.5L16.5 9.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function SpeakerRow({ speaker, selected, loading, onToggle }: SpeakerRowProps) {
  const isPlaying = speaker.playbackState === 'playing';
  const disabled = !speaker.online;

  const classNames = [
    styles.row,
    selected ? styles.selected : '',
    disabled ? styles.disabled : '',
    loading ? styles.loading : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      onClick={() => !disabled && !loading && onToggle(speaker.id)}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${speaker.name} — ${disabled ? 'Offline' : selected ? 'Selected' : 'Not selected'}`}
    >
      <div className={styles.icon}>{speakerIcon(speaker.model)}</div>

      <div className={styles.info}>
        <div className={styles.name}>{speaker.name}</div>
        <div className={styles.meta}>
          <OnlineIndicator online={speaker.online} />
          {isPlaying ? (
            <span className={styles.playing}>Playing</span>
          ) : disabled ? (
            <span>Offline</span>
          ) : (
            <span>Vol {speaker.volume}</span>
          )}
        </div>
      </div>

      <div className={styles.check}>
        {selected ? (
          <CheckMark />
        ) : (
          <div className={styles.checkCircle} />
        )}
      </div>
    </button>
  );
}
