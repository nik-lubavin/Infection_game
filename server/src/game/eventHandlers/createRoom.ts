import { Socket } from 'socket.io';
import { SERVER_EVENTS, type RoomPlayerSide } from '@infection-game/shared';
import { roomService } from '../services/roomService.js';

export const createRoomHandler = ({ socket, userName }: { socket: Socket; userName: string }) => {
  console.log('create room handler');

  const gameRoom = roomService.createGameRoomInstance({
    redSocketId: socket.id,
    userName: userName,
  });
  socket.join(gameRoom.id);
  console.log('socket joined, room code:', gameRoom.id);
  socket.emit(SERVER_EVENTS.ROOM_CREATED, {
    roomCode: gameRoom.id,
    player: 'red' as RoomPlayerSide,
    hostName: gameRoom.hostName,
  });
};
