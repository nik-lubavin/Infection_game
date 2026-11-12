import type { EventContext } from '../../socketUtils.js';
import { registerCreateRoom } from './createRoom.js';
import { registerGameAction } from './gameAction.js';
import { registerJoinRoom } from './joinRoom.js';
import { registerLeaveRoom } from './leaveRoom.js';
import { registerListRooms } from './listRooms.js';

/** Registers every client → server event on a freshly connected socket. */
export function registerEventHandlers(ctx: EventContext): void {
  registerCreateRoom(ctx);
  registerListRooms(ctx);
  registerJoinRoom(ctx);
  registerLeaveRoom(ctx);
  registerGameAction(ctx);
}
