import { useState, useCallback, useRef } from 'react';
import { useNowPlaying } from '../hooks/useNowPlaying';
import { useSpeakers } from '../hooks/useSpeakers';
import { AlbumArt } from '../components/nowplaying/AlbumArt';
import { TrackInfo } from '../components/nowplaying/TrackInfo';
import { ProgressBar } from '../components/nowplaying/ProgressBar';
import { TransportControls } from '../components/nowplaying/TransportControls';
import { VolumeSlider } from '../components/nowplaying/VolumeSlider';
import { SpeakerRow } from '../components/speakers/SpeakerRow';
import { api } from '../services/api';
import styles from './NowPlayingPage.module.css';

export function NowPlayingPage() {
  const { nowPlaying, progress } = useNowPlaying();
  const speakers = useSpeakers();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const pendingRef = useRef(false);

  const activeSpeaker = speakers.find(
    (s) => s.id === nowPlaying?.speakerId || s.playbackState === 'playing'
  );

  // Determine which speakers are in the playing group
  const playingSpeaker = speakers.find((s) => s.playbackState === 'playing' && s.isCoordinator);
  const playingGroupMembers = playingSpeaker
    ? new Set([playingSpeaker.id, ...playingSpeaker.groupMembers])
    : new Set<string>();

  const isSelected = (id: string) => playingGroupMembers.has(id);

  const handleToggle = useCallback(
    async (id: string) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setLoadingIds((prev) => new Set(prev).add(id));

      try {
        if (isSelected(id)) {
          await api.ungroupSpeaker(id);
        } else if (playingSpeaker) {
          await api.addToGroup(playingSpeaker.id, id);
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

  const handleSeek = (seconds: number) => {
    if (activeSpeaker) {
      api.seek(activeSpeaker.id, seconds).catch(console.error);
    }
  };

  return (
    <div className={styles.page}>
      <AlbumArt
        url={nowPlaying?.albumArtUrl || ''}
        alt={nowPlaying?.trackTitle || 'No album art'}
      />

      <TrackInfo
        title={nowPlaying?.trackTitle || ''}
        artist={nowPlaying?.artist || ''}
        album={nowPlaying?.album || ''}
      />

      <ProgressBar
        positionSeconds={progress.positionSeconds}
        durationSeconds={progress.durationSeconds}
        onSeek={handleSeek}
      />

      <TransportControls
        isPlaying={nowPlaying?.isPlaying || false}
        speakerId={activeSpeaker?.id}
      />

      {activeSpeaker && (
        <VolumeSlider
          volume={activeSpeaker.volume}
          speakerId={activeSpeaker.id}
        />
      )}

      <section className={styles.speakerList}>
        <span className={styles.speakerListLabel}>Playing on</span>
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
    </div>
  );
}
