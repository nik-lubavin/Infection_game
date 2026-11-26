import {
  EVENTS,
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
  onEvent(socket, EVENTS.LEAVE_ROOM_REQUEST, parseLeaveRoom, ({ roomCode, playerId }) => {
    console.log('leave room handler', { roomCode, playerId });

    // TODO (T04): notify result.data.opponentId that the player left.
    const result = roomService.removePlayer(roomCode, playerId);
    if (!result.success) {
      const failed: LeaveRoomFailedPayload = { reason: result.reason };
      socket.emit(EVENTS.LEAVE_ROOM_FAILED, failed);
      return;
    }

    socket.leave(roomCode); // socket disconnected from room
    const left: PlayerLeftRoomPayload = { roomList: roomService.listRooms() };
    socket.emit(EVENTS.LEAVE_ROOM_RESPONSE, left);
  });
}
