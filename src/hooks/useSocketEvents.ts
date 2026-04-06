import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlayerType } from '../interfaces/Board';
import { io, type Socket } from 'socket.io-client';
import { CLIENT_EVENTS, SERVER_EVENTS, SOCKET_SERVER_URL } from '../constants/socketEvents';
import { getOrCreateSessionName } from '../utils/playerSession';

export interface GameRoom {
  id: string;
  status: string;
  players: {
    red: string | null; // socketId
    blue: string | null;
  };
  gameState: unknown;
  createdAt: number;
  hostName: string;
}

function createSocket(): Socket {
  return io(SOCKET_SERVER_URL);
}

export function useSocketEvents(): {
  roomData: GameRoom[];
  currentRoomId: string | null;
  refreshRooms: () => void;
  createRoom: () => void;
  socketConnected: boolean;
  connectionError: string | null;
} {
  const [roomData, setRoomData] = useState<GameRoom[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  const refreshRooms = useCallback(() => {
    socketRef.current?.emit(CLIENT_EVENTS.LIST_ROOMS);
  }, []);

  const createRoom = useCallback(() => {
    socketRef.current?.emit(CLIENT_EVENTS.REQUEST_CREATE_ROOM, {
      userName: getOrCreateSessionName(),
    });
  }, []);

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionError(null);
      setSocketConnected(true);
    });
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('connect_error', (err: Error) => {
      setConnectionError(err.message || 'Connection failed');
      setSocketConnected(false);
    });
    socket.on(SERVER_EVENTS.ROOMS_LISTED, (payload: { data: GameRoom[] }) => {
      setRoomData(payload.data ?? []);
    });
    socket.on(SERVER_EVENTS.ROOM_CREATED, (payload: { roomCode: string; player: PlayerType }) => {
      setCurrentRoomId(payload.roomCode);
      refreshRooms();
    });
    socket.on(
      SERVER_EVENTS.GAME_START,
      (payload: { roomCode: string; serializedState: string; yourPlayer: PlayerType }) => {
        console.log('game start event', payload);
        setCurrentRoomId(payload.roomCode);
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [refreshRooms]);

  useEffect(() => {
    if (socketConnected) {
      refreshRooms();
    }
  }, [socketConnected, refreshRooms]);

  return { roomData, socketConnected, connectionError, refreshRooms, createRoom, currentRoomId };
}
