import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../services/socket';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/socket-events';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket() {
  const socketRef = useRef<TypedSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket: socketRef.current, connected };
}
