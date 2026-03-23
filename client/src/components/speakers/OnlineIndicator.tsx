import styles from './OnlineIndicator.module.css';

interface OnlineIndicatorProps {
  online: boolean;
  size?: 'sm' | 'md';
}

export function OnlineIndicator({ online, size = 'sm' }: OnlineIndicatorProps) {
  return (
    <span
      className={`${styles.dot} ${online ? styles.online : styles.offline} ${styles[size]}`}
      aria-label={online ? 'Online' : 'Offline'}
    />
  );
}
