CREATE TABLE IF NOT EXISTS device_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mac TEXT NOT NULL,
  ip TEXT,
  device_name TEXT,
  event TEXT NOT NULL,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_device_logs_mac ON device_logs(mac);
CREATE INDEX IF NOT EXISTS idx_device_logs_timestamp ON device_logs(timestamp);
