import type { IGameRoom, IGameState, RoomPlayerSide } from './types/index.js';

/** Client → server */
export const CLIENT_REQUEST_EVENTS = {
  CREATE_ROOM: 'request_create_room',
  LIST_ROOMS: 'list_rooms',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  GAME_ACTION: 'game_action',
} as const;

/** Server → client */
export const SERVER_EVENTS = {
  ROOM_CREATED: 'room_created',
  ROOMS_LISTED: 'rooms_listed',
  JOIN_FAILED: 'join_failed',
  GAME_START: 'game_start',
  STATE_UPDATE: 'state_update',
  PLAYER_LEFT: 'player_left',
  ACTION_REJECTED: 'action_rejected',
  LEAVE_ROOM_FAILED: 'leave_room_failed',
  GAME_STATE_UPDATE: 'game_state_update',
} as const;

// Client request payloads
export interface CreateRoomPayload {
  userName: string;
  playerId: string;
}

export interface ListRoomsPayload {
  playerId: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  playerId: string;
}

export interface LeaveRoomPayload {
  roomCode: string;
  playerId: string;
}

export interface GameActionPayload {
  roomCode: string;
  action: unknown;
}

// Server events payloads
export interface RoomCreatedPayload {
  room: IGameRoom;
  player: RoomPlayerSide;
}

export interface RoomsListedPayload {
  data: IGameRoom[];
}

export interface JoinFailedPayload {
  reason: string;
}

export interface LeaveRoomFailedPayload {
  reason: string;
}

export interface PlayerLeftRoomPayload {
  roomList: IGameRoom[];
}

export interface GameStartPayload {
  roomCode: string;
  serializedState: IGameState;
  yourPlayer: RoomPlayerSide;
  turn: RoomPlayerSide;
}
