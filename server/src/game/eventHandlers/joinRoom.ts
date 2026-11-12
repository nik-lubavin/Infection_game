import type { Server, Socket } from 'socket.io';
import {
  GameStartPayload,
  JoinRoomPayload,
  SERVER_EVENTS,
  type RoomPlayerSide,
} from '@infection-game/shared';
import { roomService } from '../services/roomService.js';

export async function joinRoomHandler({
  socket,
  io,
  payload,
}: {
  socket: Socket;
  io: Server;
  payload: JoinRoomPayload;
}): Promise<void> {
  console.log('join game event', payload);
  const { roomCode, playerId } = payload;

  const result = roomService.assignBluePlayerToRoom(roomCode, playerId);
  if (!result.success) {
    socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: result.reason });
    return;
  }

  const room = result.data;

  socket.data.playerId = playerId;
  socket.join(roomCode);
  console.log(`player ${playerId} joined room ${roomCode}`);

  const notifyGameStart = async () => {
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

      s.emit(SERVER_EVENTS.GAME_START, gameStartPayload);
    }
  };
  await notifyGameStart();
}
