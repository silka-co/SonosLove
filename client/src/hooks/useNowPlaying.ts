import { useEffect, useState, useRef } from 'react';
import { getSocket } from '../services/socket';
import type { NowPlayingState } from '../types';

export function useNowPlaying() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingState | null>(null);
  const [progress, setProgress] = useState({ positionSeconds: 0, durationSeconds: 0 });
  const nowPlayingRef = useRef(nowPlaying);

  useEffect(() => {
    nowPlayingRef.current = nowPlaying;
  }, [nowPlaying]);

  useEffect(() => {
    const socket = getSocket();

    const handleUpdate = (state: NowPlayingState) => {
      setNowPlaying(state);
      setProgress({
        positionSeconds: state.positionSeconds,
        durationSeconds: state.durationSeconds,
      });
    };

    const handleProgress = (data: { positionSeconds: number; durationSeconds: number }) => {
      setProgress(data);
    };

    socket.on('nowPlaying:update', handleUpdate);
    socket.on('nowPlaying:progress', handleProgress);

    return () => {
      socket.off('nowPlaying:update', handleUpdate);
      socket.off('nowPlaying:progress', handleProgress);
    };
  }, []);

  return { nowPlaying, progress };
}
