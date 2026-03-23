import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import styles from './ConnectivityTimeline.module.css';

interface LogEntry {
  id: number;
  mac: string;
  device_name: string;
  event: 'online' | 'offline';
  timestamp: string;
}

export function ConnectivityTimeline() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMonitoringLogs(24)
      .then((data) => setLogs(data as unknown as LogEntry[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Loading history...</div>;
  if (logs.length === 0) return <div className={styles.empty}>No connectivity events yet</div>;

  // Group by device
  const byDevice = new Map<string, LogEntry[]>();
  for (const log of logs) {
    const key = log.device_name || log.mac;
    if (!byDevice.has(key)) byDevice.set(key, []);
    byDevice.get(key)!.push(log);
  }

  return (
    <div className={styles.timeline}>
      <h3 className={styles.heading}>Recent Activity (24h)</h3>
      {Array.from(byDevice.entries()).map(([name, entries]) => (
        <div key={name} className={styles.device}>
          <span className={styles.deviceName}>{name}</span>
          <div className={styles.events}>
            {entries.slice(0, 5).map((entry) => (
              <span
                key={entry.id}
                className={`${styles.event} ${entry.event === 'online' ? styles.online : styles.offline}`}
                title={`${entry.event} at ${new Date(entry.timestamp).toLocaleTimeString()}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
