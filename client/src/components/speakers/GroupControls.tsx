import type { SpeakerState } from '../../types';
import { api } from '../../services/api';
import styles from './GroupControls.module.css';

interface GroupControlsProps {
  speakers: SpeakerState[];
  selectedIds: Set<string>;
  onClearSelection: () => void;
}

export function GroupControls({ speakers, selectedIds, onClearSelection }: GroupControlsProps) {
  const selectedSpeakers = speakers.filter((s) => selectedIds.has(s.id));
  if (selectedSpeakers.length < 2) return null;

  const handleGroup = async () => {
    const [coordinator, ...members] = selectedSpeakers;
    try {
      await api.groupSpeakers(coordinator.id, members.map((m) => m.id));
      onClearSelection();
    } catch (err) {
      console.error('Failed to group speakers:', err);
    }
  };

  const handleUngroup = async () => {
    try {
      for (const s of selectedSpeakers) {
        await api.ungroupSpeaker(s.id);
      }
      onClearSelection();
    } catch (err) {
      console.error('Failed to ungroup speakers:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        {selectedSpeakers.map((s) => s.name).join(', ')}
      </div>
      <div className={styles.actions}>
        <button className={styles.groupBtn} onClick={handleGroup}>
          Group Together
        </button>
        <button className={styles.ungroupBtn} onClick={handleUngroup}>
          Ungroup All
        </button>
        <button className={styles.cancelBtn} onClick={onClearSelection}>
          Cancel
        </button>
      </div>
    </div>
  );
}
