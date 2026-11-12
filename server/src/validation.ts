export type ParseResult<T> = { ok: true; value: T } | { ok: false; reason: string };
/**
 * Parses a client payload of type `T`. The type is the contract; it is not guaranteed at
 * runtime (Socket.IO delivers `any`), so a parser still checks every field and returns a
 * fresh object.
 */
export type Parser<T> = (raw: T) => ParseResult<T>;

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

export function invalidResult(reason: string): { ok: false; reason: string } {
  return { ok: false, reason };
}

interface RoomAndPlayer {
  roomCode: string;
  playerId: string;
}

/** Payload shape shared by the events that address a room on behalf of a player. */
export function parseRoomAndPlayer(
  raw: unknown
): ParseResult<{ roomCode: string; playerId: string }> {
  if (!isRecord(raw)) return invalidResult('Invalid payload');
  if (!isNonEmptyString(raw.roomCode, MAX_ROOM_CODE_LENGTH))
    return invalidResult('Invalid room code');
  if (!isNonEmptyString(raw.playerId, MAX_PLAYER_ID_LENGTH))
    return invalidResult('Invalid player id');
  return { ok: true, value: { roomCode: raw.roomCode, playerId: raw.playerId } };
}
