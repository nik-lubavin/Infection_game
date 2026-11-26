import { useCallback, useEffect, type Dispatch } from 'react';
import { App as AntdApp } from 'antd';
import type { Socket } from 'socket.io-client';
import {
  EVENTS,
  PlayerLeftRoomPayload,
  RoomsListedPayload,
  type IGameRoom,
  type JoinFailedPayload,
  type JoinRoomPayload,
  type LeaveRoomFailedPayload,
  type LeaveRoomPayload,
  type RequestFailedPayload,
  type RoomCreatedPayload,
} from '@infection-game/shared';
import { usePlayerSession } from './usePlayerSession';
import type { SessionAction } from '../session/sessionReducer';

export function useRoomEvents(
  socket: Socket | null,
  dispatch: Dispatch<SessionAction>
): {
  actionListRooms: () => void;
  actionCreateRoom: () => void;
  actionJoinRoom: (room: IGameRoom) => void;
  actionLeaveRoom: (roomCode: string) => void;
} {
  // Only to find the player's own room in the list; the server never gets it from a payload.
  const { playerId } = usePlayerSession();
  const { message } = AntdApp.useApp();

  const actionCreateRoom = useCallback(() => {
    socket?.emit(EVENTS.CREATE_ROOM_REQUEST);
  }, [socket]);

  const actionListRooms = useCallback(() => {
    socket?.emit(EVENTS.LIST_ROOMS_REQUEST);
  }, [socket]);

  const actionJoinRoom = useCallback(
    (room: IGameRoom) => {
      const payload: JoinRoomPayload = { roomCode: room.id };
      socket?.emit(EVENTS.JOIN_ROOM_REQUEST, payload);
    },
    [socket]
  );

  const actionLeaveRoom = useCallback(
    (roomCode: string) => {
      const payload: LeaveRoomPayload = { roomCode };
      socket?.emit(EVENTS.LEAVE_ROOM_REQUEST, payload);
    },
    [socket]
  );

  useEffect(() => {
    if (!socket) return;

    const onListed = (payload: RoomsListedPayload) => {
      dispatch({ type: 'roomListReceived', roomList: payload.data ?? [], playerId });
    };

    const onRoomCreated = (payload: RoomCreatedPayload) => {
      dispatch({ type: 'roomCreated', room: payload.room, yourSide: payload.player });
    };

    const onPlayerLeftRoom = (payload: PlayerLeftRoomPayload) => {
      dispatch({ type: 'roomLeft', roomList: payload.roomList });
    };

    const onJoinFailed = (payload: JoinFailedPayload) => {
      message.error(payload.reason);
    };

    const onLeaveFailed = (payload: LeaveRoomFailedPayload) => {
      message.error(payload.reason);
    };

    const onRequestFailed = (payload: RequestFailedPayload) => {
      message.error(payload.reason);
    };

    const onConnect = () => {
      socket.emit(EVENTS.LIST_ROOMS_REQUEST);
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
  }, [socket, playerId, dispatch, message]);

  return {
    actionListRooms,
    actionCreateRoom,
    actionJoinRoom,
    actionLeaveRoom,
  };
}
