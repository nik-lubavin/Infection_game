import {
  EVENTS,
  type GameStartPayload,
  type JoinFailedPayload,
  type JoinRoomPayload,
  type RoomPlayerSide,
} from '@infection-game/shared';
import { getPlayerSide, roomService } from '../services/roomService.js';
import { onEvent, type EventContext } from '../../socketUtils.js';
import { parseRoomAndPlayer, type ParseResult } from '../../validation.js';

export function parseJoinRoom(raw: JoinRoomPayload): ParseResult<JoinRoomPayload> {
  return parseRoomAndPlayer(raw);
}

export function registerJoinRoom({ socket, io }: EventContext): void {
  onEvent(socket, EVENTS.JOIN_ROOM_REQUEST, parseJoinRoom, async ({ roomCode, playerId }) => {
    console.log('join game event', { roomCode, playerId });

    const result = roomService.playerJoinRoom(roomCode, playerId);
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

    socket.data.playerId = playerId;
    socket.join(roomCode);
    console.log(`player ${playerId} joined room ${roomCode}`);

    const payloadFor = (yourPlayer: RoomPlayerSide): GameStartPayload => ({
      roomCode,
      serializedState: room.state,
      yourPlayer,
      turn: yourPlayer === 'red' ? 'blue' : 'red',
    });

    // The joining socket gets the response, everyone else in the room is told about the join.
    const joinedSide = getPlayerSide(room, playerId);
    if (joinedSide) socket.emit(EVENTS.JOIN_ROOM_RESPONSE, payloadFor(joinedSide));

    const sockets = await io.in(roomCode).fetchSockets();
    for (const peer of sockets) {
      if (peer.id === socket.id) continue;
      const peerId = peer.data.playerId as string | undefined;
      const peerSide = peerId ? getPlayerSide(room, peerId) : null;
      if (!peerSide) continue;
      peer.emit(EVENTS.PLAYER_JOINED_ROOM, payloadFor(peerSide));
    }
  });
}
