import {
  CLIENT_REQUEST_EVENTS,
  SERVER_EVENTS,
  type IGameRoom,
  type ListRoomsPayload,
  type RoomsListedPayload,
} from '@infection-game/shared';
import { roomService } from '../services/roomService.js';
import { onEvent, type EventContext } from '../../socketUtils.js';
import {
  MAX_PLAYER_ID_LENGTH,
  invalidResult,
  isNonEmptyString,
  isRecord,
  type ParseResult,
} from '../../validation.js';

export function parseListRooms(raw: ListRoomsPayload): ParseResult<ListRoomsPayload> {
  if (!isRecord(raw)) return invalidResult('Invalid payload');
  if (!isNonEmptyString(raw.playerId, MAX_PLAYER_ID_LENGTH))
    return invalidResult('Invalid player id');
  return { ok: true, value: { playerId: raw.playerId } };
}

export function registerListRooms({ socket }: EventContext): void {
  onEvent(socket, CLIENT_REQUEST_EVENTS.LIST_ROOMS, parseListRooms, ({ playerId }) => {
    socket.data.playerId = playerId;
    for (const room of roomService.listRooms()) {
      if (room.players.red === playerId || room.players.blue === playerId) {
        socket.join(room.id);
      }
    }
    const data: IGameRoom[] = roomService.listRooms();
    const payload: RoomsListedPayload = { data };
    socket.emit(SERVER_EVENTS.ROOMS_LISTED, payload);
  });
}
