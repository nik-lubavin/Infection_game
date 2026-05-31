import { Socket } from 'socket.io';
import { CreateRoomPayload, SERVER_EVENTS, type RoomCreatedPayload } from '@infection-game/shared';
import { roomService } from '../services/roomService.js';

export const createRoomHandler = ({
  socket,
  payload,
}: {
  socket: Socket;
  payload: CreateRoomPayload;
}) => {
  socket.data.playerId = payload.playerId;
  const gameRoom = roomService.createGameRoomInstance({
    redPlayerId: payload.playerId,
    userName: payload.userName,
  });
  socket.join(gameRoom.id);
  console.log('socket joined, room code:', gameRoom.id);
  const roomCreatedPayload: RoomCreatedPayload = { room: gameRoom, player: 'red' };
  socket.emit(SERVER_EVENTS.ROOM_CREATED, roomCreatedPayload);
};
