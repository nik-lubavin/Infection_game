import {
  createInitialState,
  startGame as startGameState,
  type IGameRoom,
  type RoomPlayerSide,
} from '@infection-game/shared';

function generateRoomCode(): string {
  // const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  // let code = '';
  // for (let i = 0; i < 6; i++) {
  //   code += chars[Math.floor(Math.random() * chars.length)];
  // }
  // return rooms.has(code) ? generateRoomCode() : code;

  return '123456_' + Math.random().toString(36).substring(2, 4);
}

/** Whether the player is the host or the guest of the room. */
export function isPlayerInRoom(room: IGameRoom, playerId: string): boolean {
  return room.hostPlayerId === playerId || room.guestPlayerId === playerId;
}

/** The host plays red, the guest plays blue. Null if the player is not in the room. */
export function getPlayerSide(room: IGameRoom, playerId: string): RoomPlayerSide | null {
  if (room.hostPlayerId === playerId) return 'red';
  if (room.guestPlayerId === playerId) return 'blue';
  return null;
}

type RoomResult = { success: true; data?: IGameRoom } | { success: false; reason: string };

export class RoomService {
  private _rooms = new Map<string, IGameRoom>();

  createGameRoomInstance({
    hostPlayerId,
    hostName,
  }: {
    hostPlayerId: string;
    hostName: string;
  }): IGameRoom {
    const roomCode = generateRoomCode();
    const newRoom: IGameRoom = {
      id: roomCode,
      status: 'waiting',
      createdAt: Date.now(),
      hostPlayerId,
      hostName,
      guestPlayerId: null,
      state: createInitialState(),
    };
    this._rooms.set(roomCode, newRoom);
    console.log(`room created ${roomCode} by ${hostPlayerId}`);
    return newRoom;
  }

  listRooms(): IGameRoom[] {
    return Array.from(this._rooms.values());
  }

  getRoom(roomCode: string): IGameRoom | undefined {
    return this._rooms.get(roomCode);
  }

  playerJoinRoom(
    roomCode: string,
    playerId: string
  ): { success: true; data: IGameRoom } | { success: false; reason: string } {
    const room = this.getRoom(roomCode);
    if (!room) {
      return { success: false, reason: 'Room not found' };
    }
    if (room.hostPlayerId === playerId) {
      return { success: false, reason: 'Already in this room' };
    }
    if (room.guestPlayerId !== null) {
      return { success: false, reason: 'Room is full' };
    }

    room.guestPlayerId = playerId;
    return { success: true, data: room };
  }

  /** Starts the game of a waiting room that has both players. */
  startGame(
    roomCode: string
  ): { success: true; data: IGameRoom } | { success: false; reason: string } {
    const room = this.getRoom(roomCode);
    if (!room) {
      return { success: false, reason: 'Room not found' };
    }
    if (room.status !== 'waiting') {
      return { success: false, reason: 'Game already started' };
    }
    if (room.guestPlayerId === null) {
      return { success: false, reason: 'Waiting for another player' };
    }

    room.status = 'playing';
    room.state = startGameState(room.state);
    return { success: true, data: room };
  }

  disconnectPlayerFromRoom(roomCode: string, playerId: string): RoomResult {
    const room = this.getRoom(roomCode);
    if (!room) {
      return { success: false, reason: 'Room not found' };
    }

    if (room.hostPlayerId === playerId) {
      // The room belongs to the host: when the host leaves, the room is gone.
      console.log(`host ${playerId} left room ${roomCode}, room deleted`);
      this._rooms.delete(roomCode);
    } else if (room.guestPlayerId === playerId) {
      console.log(`guest ${playerId} left room ${roomCode}`);
      room.guestPlayerId = null;
      // The game cannot go on without the guest: the room waits for a new one.
      room.status = 'waiting';
      room.state = createInitialState(room.state.gridSize);
    } else {
      return { success: false, reason: 'You are not in this room' };
    }
    return { success: true };
  }
}

export const roomService = new RoomService();
