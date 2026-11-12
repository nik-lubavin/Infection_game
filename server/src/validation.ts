import type {
  CreateRoomPayload,
  GameActionPayloadV2,
  JoinRoomPayload,
  LeaveRoomPayload,
  ListRoomsPayload,
} from '@infection-game/shared';

export type ParseResult<T> = { ok: true; value: T } | { ok: false; reason: string };
export type Parser<T> = (raw: unknown) => ParseResult<T>;

export const MAX_NAME_LENGTH = 32;
export const MAX_ROOM_CODE_LENGTH = 16;
export const MAX_PLAYER_ID_LENGTH = 64;

const CELL_CODE_RE = /^\d{1,2}-\d{1,2}$/;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

export function isCellCode(value: unknown): value is string {
  return typeof value === 'string' && CELL_CODE_RE.test(value);
}

const invalid = (reason: string): { ok: false; reason: string } => ({ ok: false, reason });

export const parseCreateRoom: Parser<CreateRoomPayload> = (raw) => {
  if (!isRecord(raw)) return invalid('Invalid payload');
  if (!isNonEmptyString(raw.userName, MAX_NAME_LENGTH)) return invalid('Invalid user name');
  if (!isNonEmptyString(raw.playerId, MAX_PLAYER_ID_LENGTH)) return invalid('Invalid player id');
  return { ok: true, value: { userName: raw.userName, playerId: raw.playerId } };
};

export const parseListRooms: Parser<ListRoomsPayload> = (raw) => {
  if (!isRecord(raw)) return invalid('Invalid payload');
  if (!isNonEmptyString(raw.playerId, MAX_PLAYER_ID_LENGTH)) return invalid('Invalid player id');
  return { ok: true, value: { playerId: raw.playerId } };
};

function parseRoomAndPlayer(raw: unknown): ParseResult<{ roomCode: string; playerId: string }> {
  if (!isRecord(raw)) return invalid('Invalid payload');
  if (!isNonEmptyString(raw.roomCode, MAX_ROOM_CODE_LENGTH)) return invalid('Invalid room code');
  if (!isNonEmptyString(raw.playerId, MAX_PLAYER_ID_LENGTH)) return invalid('Invalid player id');
  return { ok: true, value: { roomCode: raw.roomCode, playerId: raw.playerId } };
}

export const parseJoinRoom: Parser<JoinRoomPayload> = parseRoomAndPlayer;
export const parseLeaveRoom: Parser<LeaveRoomPayload> = parseRoomAndPlayer;

export const parseGameAction: Parser<GameActionPayloadV2> = (raw) => {
  if (!isRecord(raw)) return invalid('Invalid payload');
  if (!isNonEmptyString(raw.roomCode, MAX_ROOM_CODE_LENGTH)) return invalid('Invalid room code');
  if (!isCellCode(raw.cellCode)) return invalid('Invalid cell code');
  return { ok: true, value: { roomCode: raw.roomCode, cellCode: raw.cellCode } };
};
