import {
  CLIENT_REQUEST_EVENTS,
  SERVER_EVENTS,
  type LeaveRoomFailedPayload,
  type LeaveRoomPayload,
  type PlayerLeftRoomPayload,
} from '@infection-game/shared';
import { roomService } from '../services/roomService.js';
import { onEvent, type EventContext } from '../../socketUtils.js';
import { parseRoomAndPlayer, type ParseResult } from '../../validation.js';

export function parseLeaveRoom(raw: LeaveRoomPayload): ParseResult<LeaveRoomPayload> {
  return parseRoomAndPlayer(raw);
}

export function registerLeaveRoom({ socket }: EventContext): void {
  onEvent(socket, CLIENT_REQUEST_EVENTS.LEAVE_ROOM, parseLeaveRoom, ({ roomCode, playerId }) => {
    console.log('leave room handler', { roomCode, playerId });

    const result = roomService.disconnectPlayerFromRoom(roomCode, playerId);
    if (!result.success) {
      const failed: LeaveRoomFailedPayload = { reason: result.reason };
      socket.emit(SERVER_EVENTS.LEAVE_ROOM_FAILED, failed);
      return;
    }

    socket.leave(roomCode); // socket disconnected from room
    const left: PlayerLeftRoomPayload = { roomList: roomService.listRooms() };
    socket.emit(SERVER_EVENTS.PLAYER_LEFT, left);
  });
}
