import { EVENTS, type GameActionPayloadV2 } from '@infection-game/shared';
import { onEvent, type EventContext } from '../../socketUtils.js';
import {
  MAX_ROOM_CODE_LENGTH,
  invalidResult,
  isCellCode,
  isNonEmptyString,
  isRecord,
  type ParseResult,
} from '../../validation.js';

export function parseGameAction(raw: GameActionPayloadV2): ParseResult<GameActionPayloadV2> {
  if (!isRecord(raw)) return invalidResult('Invalid payload');
  if (!isNonEmptyString(raw.roomCode, MAX_ROOM_CODE_LENGTH))
    return invalidResult('Invalid room code');
  if (!isCellCode(raw.cellCode)) return invalidResult('Invalid cell code');
  return { ok: true, value: { roomCode: raw.roomCode, cellCode: raw.cellCode } };
}

export function registerGameAction({ socket }: EventContext): void {
  onEvent(socket, EVENTS.GAME_ACTION_REQUEST, parseGameAction, () => {
    // TODO (S6): check room and turn, applyMove from shared, broadcast STATE_UPDATE
  });
}
