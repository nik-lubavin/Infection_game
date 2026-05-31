import { IGameRoom, RoomPlayerSide } from './index.js';

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

export interface CreateRoomPayload {
  userName: string;
  playerId: string;
}

export interface RoomCreatedPayload {
  room: IGameRoom;
  player: RoomPlayerSide;
}
