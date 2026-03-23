import type { SpeakerState } from '../../types';
import styles from './SpeakerPills.module.css';

interface SpeakerPillsProps {
  speakers: SpeakerState[];
  activeSpeakerId?: string;
}

export function SpeakerPills({ speakers, activeSpeakerId }: SpeakerPillsProps) {
  const playingSpeakers = speakers.filter(
    (s) => s.playbackState === 'playing' || s.id === activeSpeakerId
  );

  if (playingSpeakers.length === 0) return null;

  return (
    <div className={styles.container}>
      <span className={styles.label}>Playing on</span>
      <div className={styles.pills}>
        {playingSpeakers.map((s) => (
          <span key={s.id} className={styles.pill}>
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
