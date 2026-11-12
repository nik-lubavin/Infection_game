import type {
  IGameRoom,
  IGameState,
  IRoomSummary,
  RoomPlayerSide,
  RoomStatus,
} from './types/index.js';

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
  OPPONENT_LEFT: 'opponent_left',
  ACTION_REJECTED: 'action_rejected',
  LEAVE_ROOM_FAILED: 'leave_room_failed',
  REQUEST_FAILED: 'request_failed',
} as const;

/** Socket.IO handshake `auth` payload. */
export interface SocketAuth {
  playerId: string;
  name: string;
}

// Client request payloads (legacy: playerId/userName are removed in task S2)
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

/** New contract; replaces GameActionPayload in SH3. */
export interface GameActionPayloadV2 {
  roomCode: string;
  cellCode: string;
}

// Server events payloads (legacy)
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

// Server events payloads (new contract; V2 names replace the legacy ones in SH3)
export interface RoomsListedPayloadV2 {
  data: IRoomSummary[];
  yourRoomId: string | null;
}

export interface RoomCreatedPayloadV2 {
  room: IRoomSummary;
  yourSide: RoomPlayerSide;
}

export interface GameStartPayloadV2 {
  roomCode: string;
  state: IGameState;
  yourSide: RoomPlayerSide;
}

export interface StateUpdatePayload {
  roomCode: string;
  state: IGameState;
  status: RoomStatus;
}

export interface ActionRejectedPayload {
  reason: string;
}

export interface OpponentLeftPayload {
  roomCode: string;
}

export interface RequestFailedPayload {
  event: string;
  reason: string;
}
