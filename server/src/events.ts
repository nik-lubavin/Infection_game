/**
 * Socket.IO event names (client ↔ server)
 */

// Client → Server
export const CLIENT_REQUEST_EVENTS = {
  REQUEST_CREATE_ROOM: 'request_create_room',
  LIST_ROOMS: 'list_rooms',
  JOIN_GAME: 'join_game',
  GAME_ACTION: 'game_action',
} as const;

// Server → Client
export const SERVER_EVENTS = {
  ROOM_CREATED: 'room_created',
  ROOMS_LISTED: 'rooms_listed',
  JOIN_FAILED: 'join_failed',
  GAME_START: 'game_start',
  STATE_UPDATE: 'state_update',
  PLAYER_LEFT: 'player_left',
  ACTION_REJECTED: 'action_rejected',
} as const;
