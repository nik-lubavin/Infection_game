import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { CLIENT_REQUEST_EVENTS, SERVER_EVENTS, type IGameRoom } from '@infection-game/shared';
import { roomService } from './game/services/roomService.js';
import { createRoomHandler } from './game/eventHandlers/createRoom.js';
import { joinRoomHandler } from './game/eventHandlers/joinRoom.js';
import { leaveRoomHandler } from './game/eventHandlers/leaveRoom.js';
import { onEvent } from './socketUtils.js';
import {
  parseCreateRoom,
  parseGameAction,
  parseJoinRoom,
  parseLeaveRoom,
  parseListRooms,
} from './validation.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:3000' },
});

const PORT = Number(process.env.PORT) || 3001;

process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection', reason);
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  onEvent(socket, CLIENT_REQUEST_EVENTS.CREATE_ROOM, parseCreateRoom, (payload) => {
    createRoomHandler({ socket, payload });
  });

  onEvent(socket, CLIENT_REQUEST_EVENTS.LIST_ROOMS, parseListRooms, ({ playerId }) => {
    socket.data.playerId = playerId;
    for (const room of roomService.listRooms()) {
      if (room.players.red === playerId || room.players.blue === playerId) {
        socket.join(room.id);
      }
    }
    const data: IGameRoom[] = roomService.listRooms();
    socket.emit(SERVER_EVENTS.ROOMS_LISTED, { data });
  });

  onEvent(socket, CLIENT_REQUEST_EVENTS.JOIN_ROOM, parseJoinRoom, (payload) =>
    joinRoomHandler({ socket, io, payload })
  );

  onEvent(socket, CLIENT_REQUEST_EVENTS.LEAVE_ROOM, parseLeaveRoom, (payload) => {
    leaveRoomHandler({ socket, payload });
  });

  onEvent(socket, CLIENT_REQUEST_EVENTS.GAME_ACTION, parseGameAction, () => {
    // TODO: validate, apply action, broadcast state_update
  });

  socket.on('disconnect', () => {
    // TODO: handle player_left, cleanup empty rooms
  });
});

httpServer.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
