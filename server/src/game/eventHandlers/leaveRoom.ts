import type { Socket } from 'socket.io';
import { SERVER_EVENTS, type LeaveRoomPayload } from '@infection-game/shared';
import { roomService } from '../services/roomService.js';

export function leaveRoomHandler({
  socket,
  payload,
}: {
  socket: Socket;
  payload: LeaveRoomPayload;
}): void {
  console.log('leave room handler', payload);
  const { roomCode, playerId } = payload;

  const result = roomService.disconnectPlayerFromRoom(roomCode, playerId);
  if (!result.success) {
    socket.emit(SERVER_EVENTS.LEAVE_ROOM_FAILED, { reason: result.reason });
    return;
  }

  socket.leave(roomCode); // socket disconnected from room
  socket.emit(SERVER_EVENTS.PLAYER_LEFT, { roomList: roomService.listRooms() });
}
