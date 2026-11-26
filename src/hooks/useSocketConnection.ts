import { useEffect, useRef, useState, type RefObject } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { SocketAuth } from '@infection-game/shared';
import { SOCKET_SERVER_URL } from '../constants/socketEvents';

/** The server learns who the player is only from the handshake `auth`. */
function createSocket(auth: SocketAuth): Socket {
  return io(SOCKET_SERVER_URL, { auth });
}

export function useSocketConnection({ playerId, name }: SocketAuth): {
  socket: Socket | null;
  socketRef: RefObject<Socket | null>;
  socketConnected: boolean;
  connectionError: string | null;
  socketId: string | null;
} {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const s = createSocket({ playerId, name });
    socketRef.current = s;
    setSocket(s);

    const onConnect = () => {
      setConnectionError(null);
      setSocketConnected(true);
      setSocketId(s.id ?? null);
    };
    const onDisconnect = () => {
      setSocketConnected(false);
      setSocketId(null);
    };
    const onConnectError = (err: Error) => {
      setConnectionError(err.message || 'Connection failed');
      setSocketConnected(false);
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onConnectError);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('connect_error', onConnectError);
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setSocketConnected(false);
      setSocketId(null);
    };
  }, [playerId, name]);

  return { socket, socketRef, socketConnected, connectionError, socketId };
}
