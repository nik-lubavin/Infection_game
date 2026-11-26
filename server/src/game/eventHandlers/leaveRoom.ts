import {
  EVENTS,
  type LeaveRoomFailedPayload,
  type LeaveRoomPayload,
  type PlayerLeftRoomPayload,
} from '@infection-game/shared';
import { roomService } from '../services/roomService.js';
import { onEvent, type EventContext } from '../../socketUtils.js';
import { parseRoomCode, type ParseResult } from '../../validation.js';

export function parseLeaveRoom(raw: LeaveRoomPayload): ParseResult<LeaveRoomPayload> {
  return parseRoomCode(raw);
}

export function registerLeaveRoom({ socket }: EventContext): void {
  onEvent(socket, EVENTS.LEAVE_ROOM_REQUEST, parseLeaveRoom, ({ roomCode }) => {
    const me = socket.data.playerId;
    console.log('leave room handler', { roomCode, playerId: me });

    // TODO (T04): notify result.data.opponentId that the player left.
    const result = roomService.removePlayer(roomCode, me);
    if (!result.success) {
      const failed: LeaveRoomFailedPayload = { reason: result.reason };
      socket.emit(EVENTS.LEAVE_ROOM_FAILED, failed);
      return;
    }

    const left: PlayerLeftRoomPayload = { roomList: roomService.listRooms() };
    socket.emit(EVENTS.LEAVE_ROOM_RESPONSE, left);
  });
}
