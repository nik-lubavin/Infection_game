import { useCallback, useEffect, type Dispatch } from 'react';
import { App as AntdApp } from 'antd';
import type { Socket } from 'socket.io-client';
import {
  EVENTS,
  type CreateRoomFailedPayload,
  type JoinFailedPayload,
  type JoinRoomPayload,
  type LeaveRoomFailedPayload,
  type LeaveRoomPayload,
  type OpponentLeftPayload,
  type RequestFailedPayload,
  type RoomCreatedPayload,
  type RoomListPayload,
} from '@infection-game/shared';
import type { SessionAction } from '../session/sessionReducer';

export function useRoomEvents(
  socket: Socket | null,
  dispatch: Dispatch<SessionAction>
): {
  actionListRooms: () => void;
  actionCreateRoom: () => void;
  actionJoinRoom: (roomCode: string) => void;
  actionLeaveRoom: (roomCode: string) => void;
} {
  const { message } = AntdApp.useApp();

  const actionCreateRoom = useCallback(() => {
    socket?.emit(EVENTS.CREATE_ROOM_REQUEST);
  }, [socket]);

  const actionListRooms = useCallback(() => {
    socket?.emit(EVENTS.LIST_ROOMS_REQUEST);
  }, [socket]);

  const actionJoinRoom = useCallback(
    (roomCode: string) => {
      const payload: JoinRoomPayload = { roomCode };
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

    // The answer to our own request and the broadcast after any change look the same.
    const onRoomList = (payload: RoomListPayload) => {
      dispatch({
        type: 'roomListReceived',
        roomList: payload.data,
        yourRoomId: payload.yourRoomId,
      });
    };

    const onRoomCreated = (payload: RoomCreatedPayload) => {
      dispatch({ type: 'roomCreated', room: payload.room, yourSide: payload.yourSide });
    };

    const onRoomLeft = () => {
      dispatch({ type: 'roomLeft' });
    };

    const onOpponentLeft = (payload: OpponentLeftPayload) => {
      dispatch({ type: 'opponentLeft', room: payload.room });
      message.info(
        payload.room === null
          ? 'Opponent left. The room was closed.'
          : 'Opponent left. Waiting for a new player.'
      );
    };

    const onFailed = (
      payload:
        | CreateRoomFailedPayload
        | JoinFailedPayload
        | LeaveRoomFailedPayload
        | RequestFailedPayload
    ) => {
      message.error(payload.reason);
    };

    const onConnect = () => {
      socket.emit(EVENTS.LIST_ROOMS_REQUEST);
    };

    socket.on(EVENTS.LIST_ROOMS_RESPONSE, onRoomList);
    socket.on(EVENTS.ROOM_LIST_UPDATED, onRoomList);
    socket.on(EVENTS.CREATE_ROOM_RESPONSE, onRoomCreated);
    socket.on(EVENTS.LEAVE_ROOM_RESPONSE, onRoomLeft);
    socket.on(EVENTS.OPPONENT_LEFT, onOpponentLeft);
    socket.on(EVENTS.CREATE_ROOM_FAILED, onFailed);
    socket.on(EVENTS.JOIN_ROOM_FAILED, onFailed);
    socket.on(EVENTS.LEAVE_ROOM_FAILED, onFailed);
    socket.on(EVENTS.REQUEST_FAILED, onFailed);
    socket.on('connect', onConnect);
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off(EVENTS.LIST_ROOMS_RESPONSE, onRoomList);
      socket.off(EVENTS.ROOM_LIST_UPDATED, onRoomList);
      socket.off(EVENTS.CREATE_ROOM_RESPONSE, onRoomCreated);
      socket.off(EVENTS.LEAVE_ROOM_RESPONSE, onRoomLeft);
      socket.off(EVENTS.OPPONENT_LEFT, onOpponentLeft);
      socket.off(EVENTS.CREATE_ROOM_FAILED, onFailed);
      socket.off(EVENTS.JOIN_ROOM_FAILED, onFailed);
      socket.off(EVENTS.LEAVE_ROOM_FAILED, onFailed);
      socket.off(EVENTS.REQUEST_FAILED, onFailed);
      socket.off('connect', onConnect);
    };
  }, [socket, dispatch, message]);

  return {
    actionListRooms,
    actionCreateRoom,
    actionJoinRoom,
    actionLeaveRoom,
  };
}
