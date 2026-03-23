import type { SpeakerState, NowPlayingState } from './index.js';

export interface ServerToClientEvents {
  'speaker:state': (speakers: SpeakerState[]) => void;
  'nowPlaying:update': (state: NowPlayingState) => void;
  'nowPlaying:progress': (data: { positionSeconds: number; durationSeconds: number }) => void;
  'device:online': (data: { mac: string; ip: string; name: string; online: boolean }) => void;
  error: (data: { message: string; code: string }) => void;
}

export interface ClientToServerEvents {
  'subscribe:speaker': (data: { speakerId: string }) => void;
}
