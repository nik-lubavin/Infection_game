import type { Socket } from 'socket.io';
import { SERVER_EVENTS } from '@infection-game/shared';
import { roomService } from '../services/roomService.js';

export function leaveRoomHandler({
  socket,
  payload,
}: {
  socket: Socket;
  payload: { roomCode?: string; playerId?: string };
}): void {
  const roomCode = payload?.roomCode;
  const playerId = payload?.playerId;
  if (!roomCode || !playerId) return;

  const result = roomService.disconnectPlayerFromRoom(roomCode, playerId);
  if (!result.success) {
    socket.emit(SERVER_EVENTS.LEAVE_ROOM_FAILED, { reason: result.reason });
    return;
  }

  socket.leave(roomCode);
  socket.emit(SERVER_EVENTS.PLAYER_LEFT, { roomCode });
  socket.emit(SERVER_EVENTS.ROOMS_LISTED, { data: roomService.listRooms() });
}
