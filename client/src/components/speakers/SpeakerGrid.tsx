import type { SpeakerState } from '../../types';
import { SpeakerCard } from './SpeakerCard';
import styles from './SpeakerGrid.module.css';

interface SpeakerGridProps {
  speakers: SpeakerState[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

export function SpeakerGrid({ speakers, selectedIds, onToggle }: SpeakerGridProps) {
  const onlineSpeakers = speakers.filter((s) => s.online);
  const offlineSpeakers = speakers.filter((s) => !s.online);
  const sorted = [...onlineSpeakers, ...offlineSpeakers];

  if (speakers.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No speakers found</p>
        <p className={styles.emptyHint}>Make sure your Sonos speakers are on the same network</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {sorted.map((speaker) => (
        <SpeakerCard
          key={speaker.id}
          speaker={speaker}
          selected={selectedIds.has(speaker.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
