import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlayerType } from '../interfaces/Board';
import { io, type Socket } from 'socket.io-client';
import { CLIENT_REQUEST_EVENTS, SERVER_EVENTS } from '@infection-game/shared';
import { SOCKET_SERVER_URL } from '../constants/socketEvents';
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
  socketId: string | null;
  refreshRooms: () => void;
  createRoom: () => void;
  disconnectRoom: (roomCode: string) => void;
  socketConnected: boolean;
  connectionError: string | null;
} {
  const socketRef = useRef<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);

  const [roomData, setRoomData] = useState<GameRoom[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  const refreshRooms = useCallback(() => {
    socketRef.current?.emit(CLIENT_REQUEST_EVENTS.LIST_ROOMS);
  }, []);

  const createRoom = useCallback(() => {
    socketRef.current?.emit(CLIENT_REQUEST_EVENTS.CREATE_ROOM, {
      userName: getOrCreateSessionName(),
    });
  }, []);

  const disconnectRoom = useCallback((roomCode: string) => {
    socketRef.current?.emit(CLIENT_REQUEST_EVENTS.LEAVE_ROOM, { roomCode });
    setCurrentRoomId((id) => (id === roomCode ? null : id));
  }, []);

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionError(null);
      setSocketConnected(true);
      setSocketId(socket.id ?? null);
    });
    socket.on('disconnect', () => {
      setSocketConnected(false);
      setSocketId(null);
    });
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
    socket.on(SERVER_EVENTS.PLAYER_LEFT, (payload: { roomCode: string }) => {
      setCurrentRoomId((id) => (id === payload.roomCode ? null : id));
    });

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

  return {
    roomData,
    socketConnected,
    connectionError,
    refreshRooms,
    createRoom,
    disconnectRoom,
    socketId,
    currentRoomId,
  };
}
