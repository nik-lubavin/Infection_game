import type { DefaultEventsMap, Server, Socket } from 'socket.io';
import { EVENTS, type RequestFailedPayload } from '@infection-game/shared';
import type { Parser } from './validation.js';

/** Set by the auth middleware from the handshake before any handler runs; never changes. */
export interface SocketData {
  playerId: string;
  name: string;
}

export type GameServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;
export type GameSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;

/** What every event registration function receives. */
export interface EventContext {
  socket: GameSocket;
  io: GameServer;
}

/** Socket.IO room with every socket (browser tab) of the player. */
export function playerRoom(playerId: string): string {
  return 'player:' + playerId;
}

function emitRequestFailed(socket: GameSocket, event: string, reason: string): void {
  const payload: RequestFailedPayload = { event, reason };
  socket.emit(EVENTS.REQUEST_FAILED, payload);
}

/**
 * Registers a client event handler that cannot take the process down.
 *
 * Socket.IO runs handlers inside `process.nextTick`, so an exception thrown by a handler is
 * uncaught and kills Node. Here the payload is parsed first (a bad payload is answered with
 * `request_failed`), and the handler runs inside try/catch (async handlers: `.catch`).
 */
export function onEvent<T>(
  socket: GameSocket,
  event: string,
  parse: Parser<T>,
  handler: (payload: T) => void | Promise<void>
): void {
  const fail = (error: unknown) => {
    console.error(`[${event}] handler failed (socket ${socket.id})`, error);
    emitRequestFailed(socket, event, 'Internal error');
  };

  socket.on(event, (raw: T) => {
    try {
      const parsed = parse(raw);
      if (!parsed.ok) {
        emitRequestFailed(socket, event, parsed.reason);
        return;
      }
      const result = handler(parsed.value);
      if (result instanceof Promise) result.catch(fail);
    } catch (error) {
      fail(error);
    }
  });
}
