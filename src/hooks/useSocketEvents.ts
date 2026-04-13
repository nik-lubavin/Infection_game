import { useCallback, useEffect, useState, type RefObject } from 'react';
import type { PlayerType } from '../interfaces/Board';
import type { Socket } from 'socket.io-client';
import { CLIENT_REQUEST_EVENTS, SERVER_EVENTS } from '@infection-game/shared';
import { getOrCreateSessionName } from '../utils/playerSession';

export function useSocketEvents(
  socket: Socket | null,
  socketRef: RefObject<Socket | null>
): {
  currentRoomId: string | null;
  createRoom: () => void;
  disconnectRoom: (roomCode: string) => void;
} {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

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
    if (!socket) return;

    const onRoomCreated = (payload: { roomCode: string; player: PlayerType }) => {
      setCurrentRoomId(payload.roomCode);
    };
    const onGameStart = (payload: {
      roomCode: string;
      serializedState: string;
      yourPlayer: PlayerType;
    }) => {
      console.log('game start event', payload);
      setCurrentRoomId(payload.roomCode);
    };
    const onPlayerLeft = (payload: { roomCode: string }) => {
      setCurrentRoomId((id) => (id === payload.roomCode ? null : id));
    };

    socket.on(SERVER_EVENTS.ROOM_CREATED, onRoomCreated);
    socket.on(SERVER_EVENTS.GAME_START, onGameStart);
    socket.on(SERVER_EVENTS.PLAYER_LEFT, onPlayerLeft);

    return () => {
      socket.off(SERVER_EVENTS.ROOM_CREATED, onRoomCreated);
      socket.off(SERVER_EVENTS.GAME_START, onGameStart);
      socket.off(SERVER_EVENTS.PLAYER_LEFT, onPlayerLeft);
    };
  }, [socket]);

  return {
    currentRoomId,
    createRoom,
    disconnectRoom,
  };
}
