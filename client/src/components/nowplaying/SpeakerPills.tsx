import type { SpeakerState } from '../../types';
import styles from './SpeakerPills.module.css';

interface SpeakerPillsProps {
  speakers: SpeakerState[];
  activeSpeakerId?: string;
}

export function SpeakerPills({ speakers, activeSpeakerId }: SpeakerPillsProps) {
  // Show the active speaker and any other coordinators that are playing
  const playingSpeakers = speakers.filter(
    (s) => s.id === activeSpeakerId || s.playbackState === 'playing'
  );

  // Deduplicate by name (stereo pairs share the same name)
  const uniqueByName = playingSpeakers.filter(
    (s, i, arr) => arr.findIndex((x) => x.name === s.name) === i
  );

  if (uniqueByName.length === 0) return null;

  return (
    <div className={styles.container}>
      <span className={styles.label}>Playing on</span>
      <div className={styles.pills}>
        {uniqueByName.map((s) => (
          <span key={s.id} className={styles.pill}>
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
