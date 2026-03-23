import { useNowPlaying } from '../../hooks/useNowPlaying';
import { useSpeakers } from '../../hooks/useSpeakers';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import styles from './MiniPlayer.module.css';

export function MiniPlayer() {
  const { nowPlaying } = useNowPlaying();
  const speakers = useSpeakers();
  const navigate = useNavigate();

  if (!nowPlaying || !nowPlaying.trackTitle) return null;

  const activeSpeaker = speakers.find((s) => s.id === nowPlaying.speakerId);
  const speakerName = activeSpeaker?.name ?? '';

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    (nowPlaying.isPlaying ? api.pause(nowPlaying.speakerId) : api.play(nowPlaying.speakerId)).catch(console.error);
  };

  return (
    <div className={styles.bar} onClick={() => navigate('/')}>
      <div className={styles.art}>
        {nowPlaying.albumArtUrl ? (
          <img src={nowPlaying.albumArtUrl} alt="" className={styles.artImg} />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.title}>{nowPlaying.trackTitle}</span>
        <span className={styles.subtitle}>
          {nowPlaying.artist}{speakerName ? ` · ${speakerName}` : ''}
        </span>
      </div>
      <button className={styles.playBtn} onClick={handlePlayPause} aria-label={nowPlaying.isPlaying ? 'Pause' : 'Play'}>
        {nowPlaying.isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
