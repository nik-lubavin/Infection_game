import type { IGameRoom, RoomStatus } from '@infection-game/shared';

function generateRoomCode(): string {
  // const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  // let code = '';
  // for (let i = 0; i < 6; i++) {
  //   code += chars[Math.floor(Math.random() * chars.length)];
  // }
  // return rooms.has(code) ? generateRoomCode() : code;

  return '123456_' + Math.random().toString(36).substring(2, 4);
}

export class RoomService {
  private _rooms = new Map<string, IGameRoom>();

  createGameRoomInstance({
    redSocketId,
    userName,
  }: {
    redSocketId: string;
    userName: string;
  }): IGameRoom {
    const roomCode = generateRoomCode();
    const newRoom: IGameRoom = {
      id: roomCode,
      status: 'waiting',
      players: { red: redSocketId, blue: null },
      gameState: '',
      createdAt: Date.now(),
      hostName: userName,
    };
    this._rooms.set(roomCode, newRoom);
    console.log(`room created ${roomCode} by ${redSocketId}`);
    return newRoom;
  }

  listRooms(): IGameRoom[] {
    return Array.from(this._rooms.values());
  }

  getRoom(roomCode: string): IGameRoom | undefined {
    return this._rooms.get(roomCode);
  }

  assignBluePlayerToRoom(
    roomCode: string,
    socketId: string
  ): { success: boolean; reason?: string; data?: IGameRoom } {
    const room = roomService.getRoom(roomCode);
    if (!room) {
      // socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: 'Room not found' });
      return { success: false, reason: 'Room not found' };
    }
    if (room.players.blue !== null) {
      // socket.emit(SERVER_EVENTS.JOIN_FAILED, { reason: 'Room is full' });
      return { success: false, reason: 'Room is full' };
    }

    room.players.blue = socketId;
    room.status = 'playing' as RoomStatus;
    this.setRoom(room);
    return { success: true, data: room };
  }

  private setRoom(room: IGameRoom): void {
    this._rooms.set(room.id, room);
  }

  disconnectPlayerFromRoom(
    roomCode: string,
    socketId: string
  ): { success: boolean; reason?: string; data?: IGameRoom } {
    const room = this.getRoom(roomCode);
    if (!room) {
      return { success: false, reason: 'Room not found' };
    }
    if (room.players.red !== socketId && room.players.blue !== socketId) {
      return { success: false, reason: 'You are not in this room' };
    }

    if (room.players.red === socketId) {
      room.players.red = null;
    } else if (room.players.blue === socketId) {
      room.players.blue = null;
    }

    this.setRoom(room);
    return { success: true, data: room };
  }
}

export function removeSocketFromRoom(room: IGameRoom, socketId: string): IGameRoom {
  return {
    ...room,
    status: 'waiting' as RoomStatus,
    players: { ...room.players, blue: null },
  };
}

export const roomService = new RoomService();
