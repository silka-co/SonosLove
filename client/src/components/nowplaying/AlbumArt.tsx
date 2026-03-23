import styles from './AlbumArt.module.css';

interface AlbumArtProps {
  url: string;
  alt: string;
}

export function AlbumArt({ url, alt }: AlbumArtProps) {
  if (!url) {
    return (
      <div className={styles.placeholder}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <img src={url} alt={alt} className={styles.image} />
    </div>
  );
}
