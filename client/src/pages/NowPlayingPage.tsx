import { useNowPlaying } from '../hooks/useNowPlaying';
import { useSpeakers } from '../hooks/useSpeakers';
import { AlbumArt } from '../components/nowplaying/AlbumArt';
import { TrackInfo } from '../components/nowplaying/TrackInfo';
import { ProgressBar } from '../components/nowplaying/ProgressBar';
import { TransportControls } from '../components/nowplaying/TransportControls';
import { VolumeSlider } from '../components/nowplaying/VolumeSlider';
import { SpeakerPills } from '../components/nowplaying/SpeakerPills';
import { api } from '../services/api';
import styles from './NowPlayingPage.module.css';

export function NowPlayingPage() {
  const { nowPlaying, progress } = useNowPlaying();
  const speakers = useSpeakers();

  const activeSpeaker = speakers.find(
    (s) => s.id === nowPlaying?.speakerId || s.playbackState === 'playing'
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

      <SpeakerPills
        speakers={speakers}
        activeSpeakerId={nowPlaying?.speakerId}
      />
    </div>
  );
}
