import type { Server, Socket } from 'socket.io';
import { SERVER_EVENTS, type RoomPlayerSide } from '@infection-game/shared';
import { roomService } from '../services/roomService.js';

export function joinRoomHandler({
  socket,
  io,
  payload,
}: {
  socket: Socket;
  io: Server;
  payload: { roomCode?: string; playerId?: string };
}): void {
  console.log('join game event', payload);
  const roomCode = payload?.roomCode;
  const playerId = payload?.playerId;
  if (!roomCode) {
    socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: 'Missing room code' });
    return;
  }
  if (!playerId) {
    socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: 'Missing player id' });
    return;
  }

  const result = roomService.assignBluePlayerToRoom(roomCode, playerId);
  if (!result.success) {
    socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: result.reason });
    return;
  }

  const room = result.data!;

  socket.data.playerId = playerId;
  socket.join(roomCode);
  console.log('socket joined', roomCode);

  const notifyGameStart = async () => {
    const sockets = await io.in(roomCode).fetchSockets();
    for (const s of sockets) {
      const sid = s.data.playerId as string | undefined;
      if (!sid) continue;
      const yourPlayer: RoomPlayerSide =
        room.players.red === sid ? 'red' : room.players.blue === sid ? 'blue' : 'red';
      s.emit(SERVER_EVENTS.GAME_START, {
        roomCode,
        serializedState: room.gameState,
        yourPlayer,
      });
    }
  };
  void notifyGameStart();
}
