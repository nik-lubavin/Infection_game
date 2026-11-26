import {
  EVENTS,
  type GameStartPayload,
  type JoinFailedPayload,
  type JoinRoomPayload,
  type RoomPlayerSide,
} from '@infection-game/shared';
import { roomService } from '../services/roomService.js';
import { onEvent, playerRoom, type EventContext } from '../../socketUtils.js';
import { parseRoomCode, type ParseResult } from '../../validation.js';

export function parseJoinRoom(raw: JoinRoomPayload): ParseResult<JoinRoomPayload> {
  return parseRoomCode(raw);
}

export function registerJoinRoom({ socket, io }: EventContext): void {
  onEvent(socket, EVENTS.JOIN_ROOM_REQUEST, parseJoinRoom, ({ roomCode }) => {
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

    const payloadFor = (yourPlayer: RoomPlayerSide): GameStartPayload => ({
      roomCode,
      serializedState: room.state,
      yourPlayer,
      turn: yourPlayer === 'red' ? 'blue' : 'red',
    });

    // The joiner is the guest (blue); every tab of the host (red) learns about the join.
    io.to(playerRoom(me)).emit(EVENTS.JOIN_ROOM_RESPONSE, payloadFor('blue'));
    io.to(playerRoom(room.hostPlayerId)).emit(EVENTS.PLAYER_JOINED_ROOM, payloadFor('red'));
  });
}
