import type { SocketAuth } from '@infection-game/shared';
import {
  MAX_NAME_LENGTH,
  invalidResult,
  isNonEmptyString,
  isRecord,
  type ParseResult,
} from './validation.js';

/** Same pattern the client checks its player id cookie against (src/utils/playerSession.ts). */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Parses `socket.handshake.auth`: the only place the server learns who the player is. */
export function parseSocketAuth(auth: unknown): ParseResult<SocketAuth> {
  if (!isRecord(auth)) return invalidResult('Invalid auth');
  const { playerId, name } = auth;
  if (typeof playerId !== 'string' || !UUID_PATTERN.test(playerId))
    return invalidResult('Invalid player id');
  if (!isNonEmptyString(name, MAX_NAME_LENGTH)) return invalidResult('Invalid name');
  return { ok: true, value: { playerId, name } };
}
