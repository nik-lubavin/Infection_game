import type { Socket } from 'socket.io';
import { SERVER_EVENTS } from '@infection-game/shared';
import { getRoom, listRooms, removeSocketFromRoom, setRoom } from '../roomService.js';

export function leaveRoomHandler({
  socket,
  payload,
}: {
  socket: Socket;
  payload: { roomCode?: string };
}): void {
  const roomCode = payload?.roomCode;
  if (!roomCode) return;
  const room = getRoom(roomCode);
  if (!room) return;
  if (room.players.red !== socket.id && room.players.blue !== socket.id) return;

  socket.leave(roomCode);
  const updroom = removeSocketFromRoom(room, socket.id);
  setRoom(updroom);

  socket.emit(SERVER_EVENTS.PLAYER_LEFT, { roomCode });
  socket.emit(SERVER_EVENTS.ROOMS_LISTED, { data: listRooms() });
}
