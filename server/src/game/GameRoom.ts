/**
 * Game room state: players, game state, status
 */

export type PlayerType = 'red' | 'blue';

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface GameRoom {
  id: string;
  status: RoomStatus;
  players: {
    red: string | null;  // socketId
    blue: string | null;
  };
  gameState: unknown;  // SerializedGameState (placeholder until serialization)
  createdAt: number;
}

export function createRoom({ roomCode, redSocketId }: { roomCode: string; redSocketId: string }): GameRoom {
  return {
    id: roomCode,
    status: 'waiting',
    players: { red: redSocketId, blue: null },
    gameState: null,
    createdAt: Date.now(),
  };
}

export function assignBluePlayer({ room, blueSocketId }: { room: GameRoom; blueSocketId: string }): GameRoom {
  return {
    ...room,
    status: 'playing',
    players: { ...room.players, blue: blueSocketId },
  };
}
