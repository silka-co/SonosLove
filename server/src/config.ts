import dotenv from 'dotenv';
import type { SpeakerConfig } from './types/index.js';

dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parseSpeakers(raw: string | undefined): SpeakerConfig[] {
  if (!raw) return [];
  return raw.split(',').map((entry) => {
    const lastColon = entry.lastIndexOf(':');
    // Format: "Name:AA:BB:CC:DD:EE:FF" — name is everything before the MAC
    // MAC is always 17 chars (XX:XX:XX:XX:XX:XX)
    const mac = entry.slice(-17);
    const name = entry.slice(0, entry.length - 18); // -18 for the colon separator + MAC
    return { name: name.trim(), mac: mac.toUpperCase() };
  });
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  dbPath: process.env.DB_PATH || './data/sonoslove.db',

  router: {
    host: process.env.ROUTER_HOST || '192.168.1.1',
    user: process.env.ROUTER_USER || 'admin',
    password: process.env.ROUTER_PASSWORD || '',
    port: parseInt(process.env.ROUTER_SSH_PORT || '22', 10),
  },

  sonosSpeakers: parseSpeakers(process.env.SONOS_SPEAKERS),
};
