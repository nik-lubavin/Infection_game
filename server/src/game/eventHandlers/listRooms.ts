import { EVENTS } from '@infection-game/shared';
import { roomListFor } from '../roomBroadcast.js';
import { onEvent, type EventContext } from '../../socketUtils.js';
import { parseNoPayload } from '../../validation.js';

export function registerListRooms({ socket }: EventContext): void {
  onEvent(socket, EVENTS.LIST_ROOMS_REQUEST, parseNoPayload, () => {
    socket.emit(EVENTS.LIST_ROOMS_RESPONSE, roomListFor(socket.data.playerId));
  });
}
