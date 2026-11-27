import type { IGameState, IRoomSummary, RoomPlayerSide, RoomStatus } from './types/index.js';

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
  /** Sent to every socket whenever the room list changes; `yourRoomId` is per player. */
  ROOM_LIST_UPDATED: 'room_list_updated',

  JOIN_ROOM_REQUEST: 'join_room_request',
  JOIN_ROOM_RESPONSE: 'join_room_response',
  JOIN_ROOM_FAILED: 'join_room_failed',
  /** Sent to the host when a guest joins the room. */
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

// Client request payloads. The player is identified by `SocketAuth`, never by the payload;
// create_room_request and list_rooms_request carry no payload at all.
export interface JoinRoomPayload {
  roomCode: string;
}

export interface LeaveRoomPayload {
  roomCode: string;
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

// Server events payloads
export interface RoomListPayload {
  data: IRoomSummary[];
  /** Room the receiving player is in; null in the lobby. */
  yourRoomId: string | null;
}

export interface RoomCreatedPayload {
  room: IRoomSummary;
  yourSide: RoomPlayerSide;
}

/** Everything a player needs to show their room: sent on join, on opponent join and on reconnect. */
export interface RoomSessionPayload {
  room: IRoomSummary;
  state: IGameState;
  yourSide: RoomPlayerSide;
}

export interface LeaveRoomResponsePayload {
  roomCode: string;
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
  /** The room after the opponent left; null when the host left and the room was closed. */
  room: IRoomSummary | null;
}

export interface RequestFailedPayload {
  event: string;
  reason: string;
}
