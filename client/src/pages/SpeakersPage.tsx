import { useState, useCallback, useRef } from 'react';
import { useSpeakers } from '../hooks/useSpeakers';
import { useSocket } from '../hooks/useSocket';
import { SpeakerRow } from '../components/speakers/SpeakerRow';
import { MiniPlayer } from '../components/layout/MiniPlayer';
import { api } from '../services/api';
import styles from './SpeakersPage.module.css';

export function SpeakersPage() {
  const speakers = useSpeakers();
  const { connected } = useSocket();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const pendingRef = useRef(false);

  const onlineCount = speakers.filter((s) => s.online).length;

  // Determine which speakers are currently in a playing group
  const playingSpeaker = speakers.find((s) => s.playbackState === 'playing' && s.isCoordinator);
  const playingGroupMembers = playingSpeaker
    ? new Set([playingSpeaker.id, ...playingSpeaker.groupMembers])
    : new Set<string>();

  // A speaker is "selected" if it's in the active playing group
  const isSelected = (id: string) => playingGroupMembers.has(id);

  const handleToggle = useCallback(
    async (id: string) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setLoadingIds((prev) => new Set(prev).add(id));

      try {
        if (isSelected(id)) {
          // Unselect: remove from group
          await api.ungroupSpeaker(id);
        } else {
          // Select: add to the playing group
          if (playingSpeaker) {
            // There's already a coordinator playing — join it
            await api.addToGroup(playingSpeaker.id, id);
          } else {
            // No speaker is playing yet — just make this the active one
            // Nothing to group, but mark it ready
          }
        }
      } catch (err) {
        console.error('Speaker toggle failed:', err);
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        pendingRef.current = false;
      }
    },
    [playingSpeaker, speakers],
  );

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

      <section className={styles.list}>
        {speakers.map((speaker) => (
          <SpeakerRow
            key={speaker.id}
            speaker={speaker}
            selected={isSelected(speaker.id)}
            loading={loadingIds.has(speaker.id)}
            onToggle={handleToggle}
          />
        ))}
      </section>

      <MiniPlayer />
    </div>
  );
}
