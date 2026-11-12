import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import type { Socket } from 'socket.io-client';
import {
  CLIENT_REQUEST_EVENTS,
  CreateRoomPayload,
  PlayerLeftRoomPayload,
  RoomsListedPayload,
  SERVER_EVENTS,
  type IGameRoom,
  type JoinFailedPayload,
  type LeaveRoomFailedPayload,
  type RequestFailedPayload,
  type RoomCreatedPayload,
} from '@infection-game/shared';
import { usePlayerSession } from './usePlayerSession';

export function useRoomEvents(socket: Socket | null): {
  roomList: IGameRoom[];
  joinedRoom: IGameRoom | null;
  isRoomCreator: boolean;
  actionListRooms: () => void;
  actionCreateRoom: () => void;
  actionJoinRoom: (room: IGameRoom) => void;
  actionLeaveRoom: (roomCode: string) => void;
} {
  const [roomList, setRoomList] = useState<IGameRoom[]>([]);
  const [joinedRoom, setJoinedRoom] = useState<IGameRoom | null>(null);
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const { name: playerName, playerId } = usePlayerSession();

  const actionCreateRoom = useCallback(() => {
    const payload: CreateRoomPayload = { userName: playerName, playerId };
    socket?.emit(CLIENT_REQUEST_EVENTS.CREATE_ROOM, payload);
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
      setIsRoomCreator(joined?.hostPlayerId === playerId);
    };

    const onListed = (payload: RoomsListedPayload) => {
      const list = payload.data ?? [];
      setRoomList(list);
      syncJoinedRoomFromRoomList(list);
    };

    const onRoomCreated = (payload: RoomCreatedPayload) => {
      setJoinedRoom(payload.room);
      setIsRoomCreator(payload.room.hostPlayerId === playerId);
    };

    const onPlayerLeftRoom = (payload: PlayerLeftRoomPayload) => {
      setRoomList(payload.roomList);
      setJoinedRoom(null);
      setIsRoomCreator(false);
    };

    const onJoinFailed = (payload: JoinFailedPayload) => {
      setIsRoomCreator(false);
      message.error(payload.reason);
    };

    const onLeaveFailed = (payload: LeaveRoomFailedPayload) => {
      message.error(payload.reason);
    };

    const onRequestFailed = (payload: RequestFailedPayload) => {
      message.error(payload.reason);
    };

    const onConnect = () => {
      socket.emit(CLIENT_REQUEST_EVENTS.LIST_ROOMS, { playerId });
    };

    socket.on(SERVER_EVENTS.ROOMS_LISTED, onListed);
    socket.on(SERVER_EVENTS.ROOM_CREATED, onRoomCreated);
    socket.on(SERVER_EVENTS.PLAYER_LEFT, onPlayerLeftRoom);
    socket.on(SERVER_EVENTS.JOIN_FAILED, onJoinFailed);
    socket.on(SERVER_EVENTS.LEAVE_ROOM_FAILED, onLeaveFailed);
    socket.on(SERVER_EVENTS.REQUEST_FAILED, onRequestFailed);
    socket.on('connect', onConnect);
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off(SERVER_EVENTS.ROOMS_LISTED, onListed);
      socket.off(SERVER_EVENTS.ROOM_CREATED, onRoomCreated);
      socket.off(SERVER_EVENTS.PLAYER_LEFT, onPlayerLeftRoom);
      socket.off(SERVER_EVENTS.JOIN_FAILED, onJoinFailed);
      socket.off(SERVER_EVENTS.LEAVE_ROOM_FAILED, onLeaveFailed);
      socket.off(SERVER_EVENTS.REQUEST_FAILED, onRequestFailed);
      socket.off('connect', onConnect);
    };
  }, [socket, playerId]);

  return {
    roomList,
    joinedRoom,
    isRoomCreator,
    actionListRooms,
    actionCreateRoom,
    actionJoinRoom,
    actionLeaveRoom,
  };
}
