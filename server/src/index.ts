import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { CLIENT_REQUEST_EVENTS, SERVER_EVENTS, type GameRoom } from '@infection-game/shared';
import { roomService } from './game/services/roomService.js';
import { createRoomHandler } from './game/eventHandlers/createRoom.js';
import { joinRoomHandler } from './game/eventHandlers/joinRoom.js';
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
    console.log('list rooms');
    const data: GameRoom[] = roomService.listRooms();
    console.log('list rooms data', data);
    socket.emit(SERVER_EVENTS.ROOMS_LISTED, { data });
  });

  socket.on(CLIENT_REQUEST_EVENTS.JOIN_ROOM, (payload: { roomCode: string }) => {
    joinRoomHandler({ socket, io, payload });
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
