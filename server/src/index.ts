import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerEventHandlers } from './game/eventHandlers/index.js';

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

  registerEventHandlers({ socket, io });

  socket.on('disconnect', () => {
    // TODO: handle player_left, cleanup empty rooms
  });
});

httpServer.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
