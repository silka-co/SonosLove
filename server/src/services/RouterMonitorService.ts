import type Database from 'better-sqlite3';
import { execSSH } from '../utils/ssh.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import type { DeviceRecord, SpeakerConfig } from '../types/index.js';

interface DeviceChangeCallback {
  (data: { mac: string; ip: string; name: string; online: boolean }): void;
}

export class RouterMonitorService {
  private interval: ReturnType<typeof setInterval> | null = null;
  private knownDevices = new Map<string, DeviceRecord>();
  private speakerMacs: Map<string, string>; // MAC -> speaker name
  private db: Database.Database;
  private onChangeCallbacks: DeviceChangeCallback[] = [];

  constructor(db: Database.Database, speakers: SpeakerConfig[]) {
    this.db = db;
    this.speakerMacs = new Map(speakers.map((s) => [s.mac.toUpperCase(), s.name]));
  }

  onChange(callback: DeviceChangeCallback) {
    this.onChangeCallbacks.push(callback);
  }

  start(intervalMs = 60_000) {
    logger.info(`Router monitor starting (polling every ${intervalMs / 1000}s)`);
    // Run immediately, then on interval
    this.poll();
    this.interval = setInterval(() => this.poll(), intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    logger.info('Router monitor stopped');
  }

  getDeviceStatus(): Map<string, DeviceRecord> {
    return new Map(this.knownDevices);
  }

  isSpeakerOnline(mac: string): boolean {
    const device = this.knownDevices.get(mac.toUpperCase());
    return device?.online ?? false;
  }

  private async poll() {
    try {
      const output = await execSSH(
        {
          host: config.router.host,
          port: config.router.port,
          username: config.router.user,
          password: config.router.password,
        },
        'cat /proc/net/arp',
      );

      const currentDevices = this.parseArpTable(output);
      this.diffAndEmit(currentDevices);
    } catch (err) {
      logger.error('Router poll failed:', err);
    }
  }

  private parseArpTable(output: string): DeviceRecord[] {
    const lines = output.trim().split('\n');
    const devices: DeviceRecord[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts.length < 6) continue;

      const ip = parts[0];
      const flags = parts[2];
      const mac = parts[3].toUpperCase();

      // Skip incomplete entries (00:00:00:00:00:00)
      if (mac === '00:00:00:00:00:00') continue;

      devices.push({
        mac,
        ip,
        hostname: this.speakerMacs.get(mac),
        online: flags === '0x2',
        lastSeen: new Date().toISOString(),
      });
    }

    return devices;
  }

  private diffAndEmit(currentDevices: DeviceRecord[]) {
    const currentByMac = new Map(currentDevices.map((d) => [d.mac, d]));

    // Check for new or changed devices (only track speaker MACs)
    for (const [mac, speakerName] of this.speakerMacs) {
      const current = currentByMac.get(mac);
      const previous = this.knownDevices.get(mac);

      const isOnline = current?.online ?? false;
      const wasOnline = previous?.online ?? false;

      if (isOnline !== wasOnline || !previous) {
        const event = isOnline ? 'online' : 'offline';

        // Log to database
        this.db
          .prepare('INSERT INTO device_logs (mac, ip, device_name, event) VALUES (?, ?, ?, ?)')
          .run(mac, current?.ip ?? null, speakerName, event);

        // Emit change
        for (const cb of this.onChangeCallbacks) {
          cb({ mac, ip: current?.ip ?? '', name: speakerName, online: isOnline });
        }

        logger.info(`Speaker ${speakerName} (${mac}) is now ${event}`);
      }

      // Update known state
      this.knownDevices.set(mac, {
        mac,
        ip: current?.ip ?? previous?.ip ?? '',
        hostname: speakerName,
        online: isOnline,
        lastSeen: isOnline ? new Date().toISOString() : (previous?.lastSeen ?? ''),
      });
    }
  }
}
