import { useCallback, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { CLIENT_REQUEST_EVENTS, SERVER_EVENTS, type GameRoom } from '@infection-game/shared';

export function useRoomList(
  socket: Socket | null,
  socketConnected: boolean
): {
  roomList: GameRoom[];
  refreshRooms: () => void;
  joinedRoom: GameRoom | null;
} {
  const [roomList, setRoomList] = useState<GameRoom[]>([]);
  const [joinedRoom, setJoinedRoom] = useState<GameRoom | null>(null);

  const refreshRooms = useCallback(() => {
    socket?.emit(CLIENT_REQUEST_EVENTS.LIST_ROOMS);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const onListed = (payload: { data: GameRoom[] }) => {
      setRoomList(payload.data ?? []);

      const joinedRoom = payload.data.find((room: GameRoom) => room.players.red === socket.id);
      if (joinedRoom) {
        setJoinedRoom(joinedRoom);
      }
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

  return { roomList, refreshRooms, joinedRoom };
}
