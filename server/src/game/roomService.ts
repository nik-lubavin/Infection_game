/**
 * Game room state: players, game state, status
 */

export type PlayerType = 'red' | 'blue';

export type RoomStatus = 'waiting' | 'playing' | 'finished';

const rooms = new Map<string, GameRoom>();

function generateRoomCode(): string {
  // const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  // let code = '';
  // for (let i = 0; i < 6; i++) {
  //   code += chars[Math.floor(Math.random() * chars.length)];
  // }
  // return rooms.has(code) ? generateRoomCode() : code;

  return '123456_' + Math.random().toString(36).substring(2, 4);
}

export interface GameRoom {
  id: string;
  status: RoomStatus;
  players: {
    red: string | null; // socketId
    blue: string | null;
  };
  gameState: string;
  createdAt: number;
  hostName: string;
}

export function createGameRoomInstance({
  redSocketId,
  userName,
}: {
  redSocketId: string;
  userName: string;
}): GameRoom {
  const roomCode = generateRoomCode();
  const newRoom: GameRoom = {
    id: roomCode,
    status: 'waiting',
    players: { red: redSocketId, blue: null },
    gameState: '',
    createdAt: Date.now(),
    hostName: userName,
  };
  rooms.set(roomCode, newRoom);
  console.log(`room created ${roomCode} by ${redSocketId}`);
  return newRoom;
}

export function listRooms(): GameRoom[] {
  return Array.from(rooms.values());
}

export function getRoom(roomCode: string): GameRoom | undefined {
  return rooms.get(roomCode);
}

export function setRoom(room: GameRoom): void {
  rooms.set(room.id, room);
}

export function assignBluePlayer({
  room,
  blueSocketId,
}: {
  room: GameRoom;
  blueSocketId: string;
}): GameRoom {
  return {
    ...room,
    status: 'playing',
    players: { ...room.players, blue: blueSocketId },
  };
}
