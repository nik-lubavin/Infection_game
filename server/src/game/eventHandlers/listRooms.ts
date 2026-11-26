import { EVENTS, type RoomsListedPayload } from '@infection-game/shared';
import { roomService } from '../services/roomService.js';
import { onEvent, type EventContext } from '../../socketUtils.js';
import { parseNoPayload } from '../../validation.js';

export function registerListRooms({ socket }: EventContext): void {
  onEvent(socket, EVENTS.LIST_ROOMS_REQUEST, parseNoPayload, () => {
    const payload: RoomsListedPayload = { data: roomService.listRooms() };
    socket.emit(EVENTS.LIST_ROOMS_RESPONSE, payload);
  });
}
