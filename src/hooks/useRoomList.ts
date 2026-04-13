import { useCallback, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { CLIENT_REQUEST_EVENTS, SERVER_EVENTS, GameRoom } from '@infection-game/shared';

export function useRoomList({
  socket,
  socketConnected,
}: {
  socket: Socket | null;
  socketConnected: boolean;
}): {
  roomList: GameRoom[];
  refreshRooms: () => void;
} {
  const [roomList, setRoomList] = useState<GameRoom[]>([]);

  const refreshRooms = useCallback(() => {
    socket?.emit(CLIENT_REQUEST_EVENTS.LIST_ROOMS);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const onListed = (payload: { data: GameRoom[] }) => {
      setRoomList(payload.data ?? []);
    };
    const onRoomCreated = () => {
      socket.emit(CLIENT_REQUEST_EVENTS.LIST_ROOMS);
    };
    socket.on(SERVER_EVENTS.ROOMS_LISTED, onListed);
    socket.on(SERVER_EVENTS.ROOM_CREATED, onRoomCreated);
    return () => {
      socket.off(SERVER_EVENTS.ROOMS_LISTED, onListed);
      socket.off(SERVER_EVENTS.ROOM_CREATED, onRoomCreated);
    };
  }, [socket]);

  useEffect(() => {
    if (socketConnected) {
      refreshRooms();
    }
  }, [socketConnected, refreshRooms]);

  return { roomList, refreshRooms };
}
