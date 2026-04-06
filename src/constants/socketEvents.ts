/** Must stay in sync with server/src/events.ts */

export const CLIENT_EVENTS = {
  REQUEST_CREATE_ROOM: "request_create_room",
  LIST_ROOMS: "list_rooms",
} as const;

export const SERVER_EVENTS = {
  ROOM_CREATED: "room_created",
  ROOMS_LISTED: "rooms_listed",
  GAME_START: "game_start",
} as const;

export const SOCKET_SERVER_URL =
  process.env.REACT_APP_SOCKET_URL ?? "http://localhost:3001";
