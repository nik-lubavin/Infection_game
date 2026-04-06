import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { CLIENT_EVENTS, SERVER_EVENTS } from './events.js';
import { createRoom as createRoomInstance, assignBluePlayer, type GameRoom, type PlayerType } from './game/GameRoom.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const PORT = Number(process.env.PORT) || 3001;

// In-memory room store (TODO: consider Redis for multi-instance)
const rooms = new Map<string, GameRoom>();

function generateRoomCode(): string {
  // const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  // let code = '';
  // for (let i = 0; i < 6; i++) {
  //   code += chars[Math.floor(Math.random() * chars.length)];
  // }
  // return rooms.has(code) ? generateRoomCode() : code;

  return '123456_'+Math.random().toString(36).substring(2, 4);
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on(CLIENT_EVENTS.REQUEST_CREATE_GAME, () => {
    console.log('create game event');
    const roomCode = generateRoomCode();
    const room = createRoomInstance({ roomCode, redSocketId: socket.id });
    rooms.set(roomCode, room);
    console.log(`room created ${roomCode} by ${socket.id}`);
    socket.join(roomCode);
    console.log('socket joined, room code:', roomCode);
    socket.emit(SERVER_EVENTS.ROOM_CREATED, {
      roomCode,
      player: 'red' as PlayerType,
    });
  });

  socket.on(CLIENT_EVENTS.LIST_ROOMS, () => {
    const roomCodes = Array.from(rooms.keys());
    socket.emit(SERVER_EVENTS.ROOMS_LISTED, { roomCodes });
   })

  socket.on(CLIENT_EVENTS.JOIN_GAME, (payload: { roomCode: string }) => {
    console.log('join game event', payload);
    const roomCode = payload?.roomCode;
    if (!roomCode) {
      socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: 'Missing room code' });
      return;
    }
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: 'Room not found' });
      return;
    }
    if (room.players.blue !== null) {
      socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: 'Room is full' });
      return;
    }
    const updated = assignBluePlayer({ room, blueSocketId: socket.id });
    rooms.set(roomCode, updated);
    console.log('blue player assigned', updated);
    socket.join(roomCode);
    console.log('socket joined', roomCode);
    const redSocketId = room.players.red!;
    io.to(redSocketId).emit(SERVER_EVENTS.GAME_START, {
      roomCode,
      serializedState: room.gameState,
      yourPlayer: 'red' as PlayerType,
    });
    socket.emit(SERVER_EVENTS.GAME_START, {
      roomCode,
      serializedState: room.gameState,
      yourPlayer: 'blue' as PlayerType,
    });
  });

  socket.on(CLIENT_EVENTS.GAME_ACTION, (payload: { roomCode: string; action: unknown }) => {
    // TODO: validate, apply action, broadcast state_update
  });

  socket.on('disconnect', () => {
    // TODO: handle player_left, cleanup empty rooms
  });
});

httpServer.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
