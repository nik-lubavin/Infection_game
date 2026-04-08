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
  payload: { roomCode?: string };
}): void {
  console.log('join game event', payload);
  const roomCode = payload?.roomCode;
  if (!roomCode) {
    socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: 'Missing room code' });
    return;
  }

  const result = roomService.assignBluePlayerToRoom(roomCode, socket.id);
  if (!result.success) {
    socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: result.reason });
    return;
  }

  const room = result.data!;

  socket.join(roomCode);
  console.log('socket joined', roomCode);
  const redSocketId = room.players.red!;
  const blueSocketId = socket.id;
  io.to(redSocketId).emit(SERVER_EVENTS.GAME_START, {
    roomCode,
    serializedState: room.gameState,
    yourPlayer: 'red' as RoomPlayerSide,
  });
  io.to(blueSocketId).emit(SERVER_EVENTS.GAME_START, {
    roomCode,
    serializedState: room.gameState,
    yourPlayer: 'blue' as RoomPlayerSide,
  });
}
