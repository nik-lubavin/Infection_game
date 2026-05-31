import { useCallback, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { CLIENT_REQUEST_EVENTS, SERVER_EVENTS, IGameRoom } from '@infection-game/shared';
import { getOrCreatePlayerSession } from '../utils/playerSession';

export function useRoomEvents(socket: Socket | null): {
  roomList: IGameRoom[];
  joinedRoom: IGameRoom | null;
  actionListRooms: () => void;
  actionCreateRoom: () => void;
  actionJoinRoom: (room: IGameRoom) => void;
  actionLeaveRoom: (roomCode: string) => void;
} {
  const [roomList, setRoomList] = useState<IGameRoom[]>([]);
  const [joinedRoom, setJoinedRoom] = useState<IGameRoom | null>(null);
  const { name: playerName, playerId } = getOrCreatePlayerSession();

  const actionCreateRoom = useCallback(() => {
    socket?.emit(CLIENT_REQUEST_EVENTS.CREATE_ROOM, {
      userName: playerName,
      playerId,
    });
  }, [socket, playerName, playerId]);

  const actionListRooms = useCallback(() => {
    socket?.emit(CLIENT_REQUEST_EVENTS.LIST_ROOMS, { playerId });
  }, [socket, playerId]);

  const actionJoinRoom = useCallback(
    (room: IGameRoom) => {
      socket?.emit(CLIENT_REQUEST_EVENTS.JOIN_ROOM, {
        roomCode: room.id,
        playerId,
      });
    },
    [socket, playerId]
  );

  const actionLeaveRoom = useCallback(
    (roomCode: string) => {
      socket?.emit(CLIENT_REQUEST_EVENTS.LEAVE_ROOM, {
        roomCode,
        playerId,
      });
    },
    [socket, playerId]
  );

  useEffect(() => {
    if (!socket) return;

    const syncJoinedRoomFromRoomList = (list: IGameRoom[]) => {
      const joined = list.find(
        (room) => room.players.red === playerId || room.players.blue === playerId
      );
      setJoinedRoom(joined ?? null);
    };

    const onListed = (payload: { data: IGameRoom[] }) => {
      const list = payload.data ?? [];
      setRoomList(list);
      syncJoinedRoomFromRoomList(list);
    };

    const onRoomCreated = (payload: {
      roomCode: string;
      player: 'red' | 'blue';
      hostName: string;
      players: string[];
    }) => {
      setJoinedRoom({
        id: payload.roomCode,
        status: 'waiting',
        players: {
          red: payload.players.includes(playerId) ? 'red' : null,
          blue: payload.players.includes(playerId) ? 'blue' : null,
        },
        gameState: '',
        createdAt: Date.now(),
        hostName: payload.hostName,
      });
    };

    const onPlayerLeftRoom = (payload: { roomList: IGameRoom[] }) => {
      setRoomList(payload.roomList);
      setJoinedRoom(null);
    };

    const onConnect = () => {
      socket.emit(CLIENT_REQUEST_EVENTS.LIST_ROOMS, { playerId });
    };

    socket.on(SERVER_EVENTS.ROOMS_LISTED, onListed);
    socket.on(SERVER_EVENTS.ROOM_CREATED, onRoomCreated);
    socket.on(SERVER_EVENTS.PLAYER_LEFT, onPlayerLeftRoom);
    socket.on('connect', onConnect);
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off(SERVER_EVENTS.ROOMS_LISTED, onListed);
      socket.off(SERVER_EVENTS.ROOM_CREATED, onRoomCreated);
      socket.off('connect', onConnect);
    };
  }, [socket, playerId]);

  return {
    roomList,
    joinedRoom,
    actionListRooms,
    actionCreateRoom,
    actionJoinRoom,
    actionLeaveRoom,
  };
}
