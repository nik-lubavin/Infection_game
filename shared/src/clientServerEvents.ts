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
  CREATE_ROOM_REQUEST: 'create_room_request',
  CREATE_ROOM_RESPONSE: 'create_room_response',
  CREATE_ROOM_FAILED: 'create_room_failed',

  LIST_ROOMS_REQUEST: 'list_rooms_request',
  LIST_ROOMS_RESPONSE: 'list_rooms_response',
  LIST_ROOMS_FAILED: 'list_rooms_failed',

  JOIN_ROOM_REQUEST: 'join_room_request',
  JOIN_ROOM_RESPONSE: 'join_room_response',
  JOIN_ROOM_FAILED: 'join_room_failed',
  /** Sent to everyone else in the room when a player joins it. */
  PLAYER_JOINED_ROOM: 'player_joined_room',

  LEAVE_ROOM_REQUEST: 'leave_room_request',
  LEAVE_ROOM_RESPONSE: 'leave_room_response',
  LEAVE_ROOM_FAILED: 'leave_room_failed',

  GAME_ACTION_REQUEST: 'game_action_request',
  GAME_ACTION_RESPONSE: 'game_action_response',
  GAME_ACTION_FAILED: 'game_action_failed',

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

/** Same data as the joiner gets, with `yourPlayer` set for the receiver. */
export type PlayerJoinedRoomPayload = GameStartPayload;

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
