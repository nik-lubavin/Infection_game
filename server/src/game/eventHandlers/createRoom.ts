import {
  EVENTS,
  type CreateRoomFailedPayload,
  type RoomCreatedPayload,
} from '@infection-game/shared';
import { roomService } from '../services/roomService.js';
import { onEvent, playerRoom, type EventContext } from '../../socketUtils.js';
import { parseNoPayload } from '../../validation.js';

export function registerCreateRoom({ socket, io }: EventContext): void {
  onEvent(socket, EVENTS.CREATE_ROOM_REQUEST, parseNoPayload, () => {
    const { playerId, name } = socket.data;
    const result = roomService.createGameRoomInstance({ hostPlayerId: playerId, hostName: name });
    if (!result.success) {
      const failed: CreateRoomFailedPayload = { reason: result.reason };
      socket.emit(EVENTS.CREATE_ROOM_FAILED, failed);
      return;
    }

    const roomCreatedPayload: RoomCreatedPayload = { room: result.data, player: 'red' };
    io.to(playerRoom(playerId)).emit(EVENTS.CREATE_ROOM_RESPONSE, roomCreatedPayload);
  });
}
