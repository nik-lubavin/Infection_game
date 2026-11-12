import type {
  IGameRoom,
  IGameState,
  IRoomSummary,
  RoomPlayerSide,
  RoomStatus,
} from './types/index.js';

/**
 * Socket.IO event names. Each logical event has a pair:
 * - `X_REQUEST`: client → server;
 * - `X_RESPONSE`: server → client on success;
 * - `X_FAILED`: server → client when the request is refused.
 *
 * Events without a suffix are server-initiated.
 */
export const EVENTS = {
  CREATE_ROOM_REQUEST: 'request_create_room',
  CREATE_ROOM_RESPONSE: 'room_created',
  CREATE_ROOM_FAILED: 'create_room_failed',

  LIST_ROOMS_REQUEST: 'list_rooms',
  LIST_ROOMS_RESPONSE: 'rooms_listed',
  LIST_ROOMS_FAILED: 'list_rooms_failed',

  JOIN_ROOM_REQUEST: 'join_room',
  JOIN_ROOM_RESPONSE: 'game_start',
  JOIN_ROOM_FAILED: 'join_failed',

  LEAVE_ROOM_REQUEST: 'leave_room',
  LEAVE_ROOM_RESPONSE: 'player_left',
  LEAVE_ROOM_FAILED: 'leave_room_failed',

  GAME_ACTION_REQUEST: 'game_action',
  GAME_ACTION_RESPONSE: 'state_update',
  GAME_ACTION_FAILED: 'action_rejected',

  /** Sent to the remaining player when the opponent leaves. */
  OPPONENT_LEFT: 'opponent_left',
  /** Generic refusal for any request (bad payload, internal error). */
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

export interface CreateRoomFailedPayload {
  reason: string;
}

export interface ListRoomsFailedPayload {
  reason: string;
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
