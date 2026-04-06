import { Socket } from 'socket.io';
import { createGameRoomInstance, type GameRoom, type PlayerType } from '../roomService.js';
import { SERVER_EVENTS } from '../../events.js';

export const createRoomHandler = ({ socket, userName }: { socket: Socket; userName: string }) => {
  console.log('create game event');

  const gameRoom = createGameRoomInstance({ redSocketId: socket.id, userName: userName });
  socket.join(gameRoom.id);
  console.log('socket joined, room code:', gameRoom.id);
  socket.emit(SERVER_EVENTS.ROOM_CREATED, {
    roomCode: gameRoom.id,
    player: 'red' as PlayerType,
  });
};
