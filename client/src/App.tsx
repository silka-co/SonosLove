import { NowPlayingPage } from './pages/NowPlayingPage';
import styles from './components/layout/AppShell.module.css';

export default function App() {
  return (
    <div className={styles.shell}>
      <main className={styles.content}>
        <NowPlayingPage />
      </main>
    </div>
  );
}
