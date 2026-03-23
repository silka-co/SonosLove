import styles from './TrackInfo.module.css';

interface TrackInfoProps {
  title: string;
  artist: string;
  album: string;
}

export function TrackInfo({ title, artist, album }: TrackInfoProps) {
  return (
    <div className={styles.info}>
      <h2 className={styles.title}>{title || 'Nothing Playing'}</h2>
      <p className={styles.artist}>{artist || 'Start music from Spotify or Apple Music'}</p>
      {album && <p className={styles.album}>{album}</p>}
    </div>
  );
}
