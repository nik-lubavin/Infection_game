import type { Socket } from 'socket.io';
import { SERVER_EVENTS } from '@infection-game/shared';
import { roomService } from '../services/roomService.js';

export function leaveRoomHandler({
  socket,
  payload,
}: {
  socket: Socket;
  payload: { roomCode?: string };
}): void {
  const roomCode = payload?.roomCode;
  if (!roomCode) return;

  const result = roomService.disconnectPlayerFromRoom(roomCode, socket.id);
  if (!result.success) {
    socket.emit(SERVER_EVENTS.LEAVE_ROOM_FAILED, { reason: result.reason });
    return;
  }

  socket.leave(roomCode);
  socket.emit(SERVER_EVENTS.PLAYER_LEFT, { roomCode });
  socket.emit(SERVER_EVENTS.ROOMS_LISTED, { data: roomService.listRooms() });
}
