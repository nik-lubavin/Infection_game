import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import {
  CLIENT_REQUEST_EVENTS,
  SERVER_EVENTS,
  type GameRoom,
  type RoomPlayerSide,
} from '@infection-game/shared';
import { assignBluePlayer, getRoom, listRooms, setRoom } from './game/roomService.js';
import { createRoomHandler } from './game/eventHandlers/createRoom.js';
import { leaveRoomHandler } from './game/eventHandlers/leaveRoom.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const PORT = Number(process.env.PORT) || 3001;

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on(CLIENT_REQUEST_EVENTS.CREATE_ROOM, (payload: { userName: string }) => {
    createRoomHandler({ socket, userName: payload.userName });
  });

  socket.on(CLIENT_REQUEST_EVENTS.LIST_ROOMS, () => {
    const data: GameRoom[] = listRooms();
    socket.emit(SERVER_EVENTS.ROOMS_LISTED, { data });
  });

  socket.on(CLIENT_REQUEST_EVENTS.JOIN_GAME, (payload: { roomCode: string }) => {
    console.log('join game event', payload);
    const roomCode = payload?.roomCode;
    if (!roomCode) {
      socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: 'Missing room code' });
      return;
    }
    const room = getRoom(roomCode);
    if (!room) {
      socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: 'Room not found' });
      return;
    }
    if (room.players.blue !== null) {
      socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: 'Room is full' });
      return;
    }
    const updated = assignBluePlayer({ room, blueSocketId: socket.id });
    setRoom(updated);
    console.log('blue player assigned', updated);
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
  });

  socket.on(CLIENT_REQUEST_EVENTS.LEAVE_ROOM, (payload: { roomCode: string }) => {
    leaveRoomHandler({ socket, payload });
  });

  socket.on(CLIENT_REQUEST_EVENTS.GAME_ACTION, (payload: { roomCode: string; action: unknown }) => {
    // TODO: validate, apply action, broadcast state_update
  });

  socket.on('disconnect', () => {
    // TODO: handle player_left, cleanup empty rooms
  });
});

httpServer.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
