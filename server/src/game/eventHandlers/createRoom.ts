import {
  EVENTS,
  type CreateRoomFailedPayload,
  type CreateRoomPayload,
  type RoomCreatedPayload,
} from '@infection-game/shared';
import { roomService } from '../services/roomService.js';
import { onEvent, type EventContext } from '../../socketUtils.js';
import {
  MAX_NAME_LENGTH,
  MAX_PLAYER_ID_LENGTH,
  invalidResult,
  isNonEmptyString,
  isRecord,
  type ParseResult,
} from '../../validation.js';

export function parseCreateRoom(raw: CreateRoomPayload): ParseResult<CreateRoomPayload> {
  if (!isRecord(raw)) return invalidResult('Invalid payload');
  if (!isNonEmptyString(raw.userName, MAX_NAME_LENGTH)) return invalidResult('Invalid user name');
  if (!isNonEmptyString(raw.playerId, MAX_PLAYER_ID_LENGTH))
    return invalidResult('Invalid player id');
  return { ok: true, value: { userName: raw.userName, playerId: raw.playerId } };
}

export function registerCreateRoom({ socket }: EventContext): void {
  onEvent(socket, EVENTS.CREATE_ROOM_REQUEST, parseCreateRoom, (payload) => {
    const result = roomService.createGameRoomInstance({
      hostPlayerId: payload.playerId,
      hostName: payload.userName,
    });
    if (!result.success) {
      const failed: CreateRoomFailedPayload = { reason: result.reason };
      socket.emit(EVENTS.CREATE_ROOM_FAILED, failed);
      return;
    }

    const gameRoom = result.data;
    socket.data.playerId = payload.playerId;
    socket.join(gameRoom.id);
    console.log('socket joined, room code:', gameRoom.id);
    const roomCreatedPayload: RoomCreatedPayload = { room: gameRoom, player: 'red' };
    socket.emit(EVENTS.CREATE_ROOM_RESPONSE, roomCreatedPayload);
  });
}
