import { useState, useCallback } from 'react';
import { useSpeakers } from '../hooks/useSpeakers';
import { useSocket } from '../hooks/useSocket';
import { SpeakerGrid } from '../components/speakers/SpeakerGrid';
import { GroupControls } from '../components/speakers/GroupControls';
import { MiniPlayer } from '../components/layout/MiniPlayer';
import styles from './SpeakersPage.module.css';

export function SpeakersPage() {
  const speakers = useSpeakers();
  const { connected } = useSocket();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const onlineCount = speakers.filter((s) => s.online).length;

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Speakers</h1>
        <div className={styles.meta}>
          {connected ? (
            <span className={styles.count}>
              {onlineCount} of {speakers.length} online
            </span>
          ) : (
            <span className={styles.disconnected}>Connecting...</span>
          )}
        </div>
      </header>

      <section className={styles.section}>
        <SpeakerGrid
          speakers={speakers}
          selectedIds={selectedIds}
          onToggle={handleToggle}
        />
      </section>

      {selectedIds.size > 1 && (
        <section className={styles.section}>
          <GroupControls
            speakers={speakers}
            selectedIds={selectedIds}
            onClearSelection={() => setSelectedIds(new Set())}
          />
        </section>
      )}

      <MiniPlayer />

      {selectedIds.size > 0 && selectedIds.size <= 1 && (
        <div className={styles.selectionBar}>
          <span>{selectedIds.size} speaker selected</span>
          <button
            className={styles.clearButton}
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
