import {
  createInitialState,
  startGame as startGameState,
  type IGameRoom,
  type RoomPlayerSide,
} from '@infection-game/shared';

/** Result of a service call that can be refused. */
export type ServiceResult<T> = { success: true; data: T } | { success: false; reason: string };

/** What happened to the room after a player left it. */
export interface RemovePlayerData {
  room: IGameRoom;
  /** The player who is still in (or was in) the room with the leaver; null if there was none. */
  opponentId: string | null;
  /** True when the host left and the room no longer exists. */
  roomDeleted: boolean;
}

/** No 0/O and 1/I: the code is read and typed by people. */
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 6;

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

export class RoomService {
  private _rooms = new Map<string, IGameRoom>();

  /** A random code that no existing room uses. */
  private _generateRoomCode(): string {
    let code: string;
    do {
      code = '';
      for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
        code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
      }
    } while (this._rooms.has(code));
    return code;
  }

  /** The room of any status where the player is the host or the guest. */
  findRoomByPlayer(playerId: string): IGameRoom | undefined {
    for (const room of this._rooms.values()) {
      if (isPlayerInRoom(room, playerId)) return room;
    }
    return undefined;
  }

  createGameRoomInstance({
    hostPlayerId,
    hostName,
  }: {
    hostPlayerId: string;
    hostName: string;
  }): ServiceResult<IGameRoom> {
    if (this.findRoomByPlayer(hostPlayerId)) {
      return { success: false, reason: 'Already in a room' };
    }

    const roomCode = this._generateRoomCode();
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
    return { success: true, data: newRoom };
  }

  listRooms(): IGameRoom[] {
    return Array.from(this._rooms.values());
  }

  getRoom(roomCode: string): IGameRoom | undefined {
    return this._rooms.get(roomCode);
  }

  playerJoinRoom(roomCode: string, playerId: string): ServiceResult<IGameRoom> {
    const room = this.getRoom(roomCode);
    if (!room) {
      return { success: false, reason: 'Room not found' };
    }
    if (isPlayerInRoom(room, playerId)) {
      return { success: false, reason: 'Already in this room' };
    }
    if (this.findRoomByPlayer(playerId)) {
      return { success: false, reason: 'Already in another room' };
    }
    if (room.guestPlayerId !== null) {
      return { success: false, reason: 'Room is full' };
    }

    room.guestPlayerId = playerId;
    return { success: true, data: room };
  }

  /** Starts the game of a waiting room that has both players. */
  startGame(roomCode: string): ServiceResult<IGameRoom> {
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

  /** Takes the player out of the room. The host leaving deletes the room. */
  removePlayer(roomCode: string, playerId: string): ServiceResult<RemovePlayerData> {
    const room = this.getRoom(roomCode);
    if (!room) {
      return { success: false, reason: 'Room not found' };
    }

    if (room.hostPlayerId === playerId) {
      // The room belongs to the host: when the host leaves, the room is gone.
      const opponentId = room.guestPlayerId;
      this._rooms.delete(roomCode);
      console.log(`host ${playerId} left room ${roomCode}, room deleted`);
      return { success: true, data: { room, opponentId, roomDeleted: true } };
    }

    if (room.guestPlayerId === playerId) {
      console.log(`guest ${playerId} left room ${roomCode}`);
      room.guestPlayerId = null;
      // The game cannot go on without the guest: the room waits for a new one.
      room.status = 'waiting';
      room.state = createInitialState(room.state.gridSize);
      return {
        success: true,
        data: { room, opponentId: room.hostPlayerId, roomDeleted: false },
      };
    }

    return { success: false, reason: 'You are not in this room' };
  }
}

export const roomService = new RoomService();
