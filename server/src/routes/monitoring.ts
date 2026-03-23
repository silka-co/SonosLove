import { Router } from 'express';

export function createMonitoringRouter(db: import('better-sqlite3').Database): Router {
  const router = Router();

  router.get('/logs', (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      const logs = db
        .prepare('SELECT * FROM device_logs WHERE timestamp > ? ORDER BY timestamp DESC LIMIT 500')
        .all(since);
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get logs' });
    }
  });

  router.get('/status', (req, res) => {
    try {
      const rows = db
        .prepare(
          `SELECT mac, device_name, event, timestamp
           FROM device_logs d1
           WHERE timestamp = (SELECT MAX(timestamp) FROM device_logs d2 WHERE d2.mac = d1.mac)
           GROUP BY mac`
        )
        .all() as Array<{ mac: string; device_name: string; event: string; timestamp: string }>;

      const status: Record<string, { online: boolean; lastSeen: string; name: string }> = {};
      for (const row of rows) {
        status[row.mac] = {
          online: row.event === 'online',
          lastSeen: row.timestamp,
          name: row.device_name || row.mac,
        };
      }
      res.json(status);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get status' });
    }
  });

  return router;
}
