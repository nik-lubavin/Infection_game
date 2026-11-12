import {
  EVENTS,
  type GameStartPayload,
  type JoinFailedPayload,
  type JoinRoomPayload,
  type RoomPlayerSide,
} from '@infection-game/shared';
import { roomService } from '../services/roomService.js';
import { onEvent, type EventContext } from '../../socketUtils.js';
import { parseRoomAndPlayer, type ParseResult } from '../../validation.js';

export function parseJoinRoom(raw: JoinRoomPayload): ParseResult<JoinRoomPayload> {
  return parseRoomAndPlayer(raw);
}

export function registerJoinRoom({ socket, io }: EventContext): void {
  onEvent(socket, EVENTS.JOIN_ROOM_REQUEST, parseJoinRoom, async ({ roomCode, playerId }) => {
    console.log('join game event', { roomCode, playerId });

    const result = roomService.assignBluePlayerToRoom(roomCode, playerId);
    if (!result.success) {
      const failed: JoinFailedPayload = { reason: result.reason };
      socket.emit(EVENTS.JOIN_ROOM_FAILED, failed);
      return;
    }

    const room = result.data;

    socket.data.playerId = playerId;
    socket.join(roomCode);
    console.log(`player ${playerId} joined room ${roomCode}`);

    const sockets = await io.in(roomCode).fetchSockets();
    for (const s of sockets) {
      const sid = s.data.playerId as string | undefined;
      if (!sid) continue;
      const yourPlayer: RoomPlayerSide =
        room.players.red === sid ? 'red' : room.players.blue === sid ? 'blue' : 'red';

      const gameStartPayload: GameStartPayload = {
        roomCode,
        serializedState: room.state,
        yourPlayer,
        turn: yourPlayer === 'red' ? 'blue' : 'red',
      };

      s.emit(EVENTS.JOIN_ROOM_RESPONSE, gameStartPayload);
    }
  });
}
