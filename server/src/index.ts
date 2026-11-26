import express from 'express';
import { createServer } from 'http';
import { Server, type DefaultEventsMap } from 'socket.io';
import { parseSocketAuth } from './auth.js';
import { registerEventHandlers } from './game/eventHandlers/index.js';
import { playerRoom, type GameServer, type SocketData } from './socketUtils.js';

const app = express();
const httpServer = createServer(app);
const io: GameServer = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>(
  httpServer,
  {
    cors: { origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:3000' },
  }
);

const PORT = Number(process.env.PORT) || 3001;

process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection', reason);
});

// The player's identity comes only from the handshake; handlers read it from socket.data.
io.use((socket, next) => {
  const auth = parseSocketAuth(socket.handshake.auth);
  if (!auth.ok) return next(new Error('INVALID_AUTH'));
  socket.data.playerId = auth.value.playerId;
  socket.data.name = auth.value.name;
  next();
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id, socket.data.playerId);

  socket.join(playerRoom(socket.data.playerId));
  registerEventHandlers({ socket, io });

  socket.on('disconnect', () => {
    // TODO: handle player_left, cleanup empty rooms
  });
});

httpServer.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
