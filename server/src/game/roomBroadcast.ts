import {
  EVENTS,
  type IGameRoom,
  type IRoomSummary,
  type RoomListPayload,
  type RoomSessionPayload,
} from '@infection-game/shared';
import { getPlayerSide, roomService } from './services/roomService.js';
import type { GameServer } from '../socketUtils.js';

/** The only room view that goes to clients: no player ids, no game state. */
export function toRoomSummary(room: IGameRoom): IRoomSummary {
  return {
    id: room.id,
    status: room.status,
    hostName: room.hostName,
    hasGuest: room.guestPlayerId !== null,
  };
}

/** Summaries of all rooms, newest first. */
function roomSummaries(): IRoomSummary[] {
  return roomService
    .listRooms()
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(toRoomSummary);
}

/** The room list as one player sees it. */
export function roomListFor(playerId: string, data = roomSummaries()): RoomListPayload {
  return { data, yourRoomId: roomService.findRoomByPlayer(playerId)?.id ?? null };
}

/** The room and game as one of its players sees them; null if the player is not in the room. */
export function roomSessionFor(room: IGameRoom, playerId: string): RoomSessionPayload | null {
  const yourSide = getPlayerSide(room, playerId);
  if (yourSide === null) return null;
  return { room: toRoomSummary(room), state: room.state, yourSide };
}

/** Sends every connected socket the current room list with its own `yourRoomId`. */
export async function emitRoomList(io: GameServer): Promise<void> {
  const data = roomSummaries();
  const sockets = await io.fetchSockets();
  for (const socket of sockets) {
    socket.emit(EVENTS.ROOM_LIST_UPDATED, roomListFor(socket.data.playerId, data));
  }
}
