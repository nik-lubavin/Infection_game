import { EVENTS, type JoinFailedPayload, type JoinRoomPayload } from '@infection-game/shared';
import { roomService } from '../services/roomService.js';
import { emitRoomList, roomSessionFor } from '../roomBroadcast.js';
import { onEvent, playerRoom, type EventContext } from '../../socketUtils.js';
import { parseRoomCode, type ParseResult } from '../../validation.js';

export function parseJoinRoom(raw: JoinRoomPayload): ParseResult<JoinRoomPayload> {
  return parseRoomCode(raw);
}

export function registerJoinRoom({ socket, io }: EventContext): void {
  onEvent(socket, EVENTS.JOIN_ROOM_REQUEST, parseJoinRoom, async ({ roomCode }) => {
    const me = socket.data.playerId;
    console.log('join game event', { roomCode, playerId: me });

    const result = roomService.playerJoinRoom(roomCode, me);
    if (!result.success) {
      const failed: JoinFailedPayload = { reason: result.reason };
      socket.emit(EVENTS.JOIN_ROOM_FAILED, failed);
      return;
    }

    const started = roomService.startGame(roomCode);
    if (!started.success) {
      const failed: JoinFailedPayload = { reason: started.reason };
      socket.emit(EVENTS.JOIN_ROOM_FAILED, failed);
      return;
    }

    const room = started.data;
    console.log(`player ${me} joined room ${roomCode}`);

    // Every tab of the guest gets the game; every tab of the host learns the game started.
    const guestSession = roomSessionFor(room, me);
    if (guestSession) io.to(playerRoom(me)).emit(EVENTS.JOIN_ROOM_RESPONSE, guestSession);
    const hostSession = roomSessionFor(room, room.hostPlayerId);
    if (hostSession) {
      io.to(playerRoom(room.hostPlayerId)).emit(EVENTS.PLAYER_JOINED_ROOM, hostSession);
    }
    await emitRoomList(io);
  });
}
