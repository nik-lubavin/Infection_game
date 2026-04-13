import { useEffect, useRef, useState, type RefObject } from 'react';
import { io, type Socket } from 'socket.io-client';
import { SOCKET_SERVER_URL } from '../constants/socketEvents';

function createSocket(): Socket {
  return io(SOCKET_SERVER_URL);
}

export function useSocketConnection(): {
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
    const s = createSocket();
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
  }, []);

  return { socket, socketRef, socketConnected, connectionError, socketId };
}
