import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import type { Socket } from 'socket.io-client';
import {
  EVENTS,
  CreateRoomPayload,
  PlayerLeftRoomPayload,
  RoomsListedPayload,
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
    socket?.emit(EVENTS.CREATE_ROOM_REQUEST, payload);
  }, [socket, playerName, playerId]);

  const actionListRooms = useCallback(() => {
    socket?.emit(EVENTS.LIST_ROOMS_REQUEST, { playerId });
  }, [socket, playerId]);

  const actionJoinRoom = useCallback(
    (room: IGameRoom) => {
      socket?.emit(EVENTS.JOIN_ROOM_REQUEST, {
        roomCode: room.id,
        playerId,
      });
    },
    [socket, playerId]
  );

  const actionLeaveRoom = useCallback(
    (roomCode: string) => {
      socket?.emit(EVENTS.LEAVE_ROOM_REQUEST, {
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
        (room) => room.hostPlayerId === playerId || room.guestPlayerId === playerId
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
      socket.emit(EVENTS.LIST_ROOMS_REQUEST, { playerId });
    };

    socket.on(EVENTS.LIST_ROOMS_RESPONSE, onListed);
    socket.on(EVENTS.CREATE_ROOM_RESPONSE, onRoomCreated);
    socket.on(EVENTS.LEAVE_ROOM_RESPONSE, onPlayerLeftRoom);
    socket.on(EVENTS.JOIN_ROOM_FAILED, onJoinFailed);
    socket.on(EVENTS.LEAVE_ROOM_FAILED, onLeaveFailed);
    socket.on(EVENTS.REQUEST_FAILED, onRequestFailed);
    socket.on('connect', onConnect);
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off(EVENTS.LIST_ROOMS_RESPONSE, onListed);
      socket.off(EVENTS.CREATE_ROOM_RESPONSE, onRoomCreated);
      socket.off(EVENTS.LEAVE_ROOM_RESPONSE, onPlayerLeftRoom);
      socket.off(EVENTS.JOIN_ROOM_FAILED, onJoinFailed);
      socket.off(EVENTS.LEAVE_ROOM_FAILED, onLeaveFailed);
      socket.off(EVENTS.REQUEST_FAILED, onRequestFailed);
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
