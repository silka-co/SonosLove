import { useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import type { SpeakerState } from '../types';

export function useSpeakers() {
  const [speakers, setSpeakers] = useState<SpeakerState[]>([]);

  useEffect(() => {
    const socket = getSocket();

    const handleState = (data: SpeakerState[]) => {
      setSpeakers(data);
    };

    socket.on('speaker:state', handleState);

    return () => {
      socket.off('speaker:state', handleState);
    };
  }, []);

  return speakers;
}
