import { useLocation, useNavigate } from 'react-router-dom';
import styles from './BottomNav.module.css';

const tabs = [
  {
    path: '/',
    label: 'Now Playing',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    path: '/speakers',
    label: 'Speakers',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <circle cx="12" cy="14" r="4" />
        <line x1="12" y1="6" x2="12.01" y2="6" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={styles.nav}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            className={`${styles.tab} ${active ? styles.active : ''}`}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <span className={styles.icon}>{tab.icon}</span>
            <span className={styles.label}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
