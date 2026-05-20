import { Socket } from 'socket.io';
import { SERVER_EVENTS, type RoomPlayerSide } from '@infection-game/shared';
import { roomService } from '../services/roomService.js';

export const createRoomHandler = ({
  socket,
  userName,
  playerId,
}: {
  socket: Socket;
  userName: string;
  playerId: string;
}) => {
  socket.data.playerId = playerId;
  const gameRoom = roomService.createGameRoomInstance({
    redPlayerId: playerId,
    userName: userName,
  });
  socket.join(gameRoom.id);
  console.log('socket joined, room code:', gameRoom.id);
  socket.emit(SERVER_EVENTS.ROOM_CREATED, {
    roomCode: gameRoom.id,
    player: 'red' as RoomPlayerSide,
    hostName: gameRoom.hostName,
    players: [playerId],
  });
};
