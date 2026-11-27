import {
  EVENTS,
  type LeaveRoomFailedPayload,
  type LeaveRoomPayload,
  type LeaveRoomResponsePayload,
  type OpponentLeftPayload,
} from '@infection-game/shared';
import { roomService } from '../services/roomService.js';
import { emitRoomList, toRoomSummary } from '../roomBroadcast.js';
import { onEvent, playerRoom, type EventContext } from '../../socketUtils.js';
import { parseRoomCode, type ParseResult } from '../../validation.js';

export function parseLeaveRoom(raw: LeaveRoomPayload): ParseResult<LeaveRoomPayload> {
  return parseRoomCode(raw);
}

export function registerLeaveRoom({ socket, io }: EventContext): void {
  onEvent(socket, EVENTS.LEAVE_ROOM_REQUEST, parseLeaveRoom, async ({ roomCode }) => {
    const me = socket.data.playerId;
    console.log('leave room handler', { roomCode, playerId: me });

    const result = roomService.removePlayer(roomCode, me);
    if (!result.success) {
      const failed: LeaveRoomFailedPayload = { reason: result.reason };
      socket.emit(EVENTS.LEAVE_ROOM_FAILED, failed);
      return;
    }

    const { room, opponentId, roomDeleted } = result.data;
    const left: LeaveRoomResponsePayload = { roomCode };
    io.to(playerRoom(me)).emit(EVENTS.LEAVE_ROOM_RESPONSE, left);

    if (opponentId !== null) {
      const opponentLeft: OpponentLeftPayload = {
        roomCode,
        room: roomDeleted ? null : toRoomSummary(room),
      };
      io.to(playerRoom(opponentId)).emit(EVENTS.OPPONENT_LEFT, opponentLeft);
    }
    await emitRoomList(io);
  });
}
