import { useCallback, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { CLIENT_REQUEST_EVENTS, SERVER_EVENTS, IGameRoom } from '@infection-game/shared';
import { getOrCreateSessionName } from '../utils/playerSession';

export function useRoomEvents(
  socket: Socket | null,
  socketConnected: boolean
): {
  stateRoomList: IGameRoom[];
  stateJoinedRoom: IGameRoom | null;
  actionListRooms: () => void;
  actionCreateRoom: () => void;
  actionJoinRoom: (roomCode: string) => void;
  actionLeaveRoom: (roomCode: string) => void;
} {
  const [stateRoomList, setStateRoomList] = useState<IGameRoom[]>([]);
  const [stateJoinedRoom, setStateJoinedRoom] = useState<IGameRoom | null>(null);

  const actionCreateRoom = useCallback(() => {
    socket?.emit(CLIENT_REQUEST_EVENTS.CREATE_ROOM, {
      userName: getOrCreateSessionName(),
      userId: socket?.id,
    });
  }, [socket]);

  const actionListRooms = useCallback(() => {
    socket?.emit(CLIENT_REQUEST_EVENTS.LIST_ROOMS);
  }, [socket]);

  const actionJoinRoom = useCallback(
    (roomCode: string) => {
      socket?.emit(CLIENT_REQUEST_EVENTS.JOIN_ROOM, {
        roomCode,
        userId: socket?.id,
      });
    },
    [socket]
  );

  const actionLeaveRoom = useCallback(
    (roomCode: string) => {
      socket?.emit(CLIENT_REQUEST_EVENTS.LEAVE_ROOM, {
        roomCode,
        userId: socket?.id,
      });
    },
    [socket]
  );

  // assigning handlers on mount
  useEffect(() => {
    if (!socket) return;

    const onListed = (payload: { data: IGameRoom[] }) => {
      const list = payload.data ?? [];
      setStateRoomList(list);
      const sid = socket.id;
      const mine = list.find(
        (room: IGameRoom) => room.players.red === sid || room.players.blue === sid
      );
      setStateJoinedRoom(mine ?? null);
    };

    const onRoomCreated = (payload: { data: IGameRoom }) => {
      console.log('room created', payload);
      setStateJoinedRoom(payload.data);
      // socket.emit(CLIENT_REQUEST_EVENTS.LIST_ROOMS);
    };
    socket.on(SERVER_EVENTS.ROOMS_LISTED, onListed);
    socket.on(SERVER_EVENTS.ROOM_CREATED, onRoomCreated);

    return () => {
      socket.off(SERVER_EVENTS.ROOMS_LISTED, onListed);
      socket.off(SERVER_EVENTS.ROOM_CREATED, onRoomCreated);
    };
  }, [socket]);

  // refreshing rooms on socket connect
  useEffect(() => {
    if (socketConnected) {
      actionListRooms();
    }
  }, [socketConnected, actionListRooms]);

  return {
    stateRoomList: stateRoomList,
    stateJoinedRoom: stateJoinedRoom,
    actionListRooms,
    actionCreateRoom,
    actionJoinRoom,
    actionLeaveRoom,
  };
}
