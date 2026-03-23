export interface SpeakerState {
  id: string;
  name: string;
  ip: string;
  model: string;
  volume: number;
  muted: boolean;
  isCoordinator: boolean;
  groupId: string;
  groupMembers: string[];
  playbackState: 'playing' | 'paused' | 'stopped' | 'transitioning';
  online: boolean;
}

export interface NowPlayingState {
  speakerId: string;
  trackTitle: string;
  artist: string;
  album: string;
  albumArtUrl: string;
  durationSeconds: number;
  positionSeconds: number;
  isPlaying: boolean;
}

export interface DeviceRecord {
  mac: string;
  ip: string;
  hostname?: string;
  online: boolean;
  lastSeen: string;
}

export interface DeviceLog {
  id: number;
  mac: string;
  ip: string | null;
  device_name: string | null;
  event: 'online' | 'offline';
  timestamp: string;
}

export interface SpeakerConfig {
  name: string;
  mac: string;
}
