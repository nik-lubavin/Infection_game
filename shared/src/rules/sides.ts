import { GamePhase, PlayerType, type RoomPlayerSide } from '../types/index.js';

/** A side of the game: either the `PlayerType` enum or its wire form ('red' | 'blue'). */
export type Side = PlayerType | RoomPlayerSide;

export function sideKey(side: Side): RoomPlayerSide {
  return side === PlayerType.RED ? 'red' : 'blue';
}

export function opponentOf(side: Side): RoomPlayerSide {
  return sideKey(side) === 'red' ? 'blue' : 'red';
}

export function toPlayerType(side: Side): PlayerType {
  return sideKey(side) === 'red' ? PlayerType.RED : PlayerType.BLUE;
}

/** Side that moves in the given phase, or null if nobody does. */
export function phaseSide(phase: GamePhase): RoomPlayerSide | null {
  if (phase === GamePhase.RED_TURN) return 'red';
  if (phase === GamePhase.BLUE_TURN) return 'blue';
  return null;
}

export function turnPhaseOf(side: Side): GamePhase {
  return sideKey(side) === 'red' ? GamePhase.RED_TURN : GamePhase.BLUE_TURN;
}
