import { GamePhase, type IColonySet, type IGameState } from '../types/index.js';
import {
  DEFAULT_GRID_SIZE,
  MAX_GRID_SIZE,
  MIN_GRID_SIZE,
  getAdjacentCellCodes,
  isValidCellCode,
} from './board.js';
import { coloniesOf, getAvailableCellCodes, getCellType, virusesOf } from './cells.js';
import { opponentOf, phaseSide, sideKey, toPlayerType, turnPhaseOf, type Side } from './sides.js';

export const MOVES_PER_TURN = 3;

export type MoveRejectReason =
  | 'GAME_NOT_ACTIVE' // gamePhase is neither RED_TURN nor BLUE_TURN
  | 'NOT_YOUR_TURN'
  | 'INVALID_CELL' // not a "row-col" code or outside the board
  | 'CELL_NOT_AVAILABLE';

export type MoveResult = { ok: true; state: IGameState } | { ok: false; reason: MoveRejectReason };

export function createInitialState(gridSize: number = DEFAULT_GRID_SIZE): IGameState {
  if (!Number.isInteger(gridSize) || gridSize < MIN_GRID_SIZE || gridSize > MAX_GRID_SIZE) {
    throw new RangeError(
      `gridSize must be an integer between ${MIN_GRID_SIZE} and ${MAX_GRID_SIZE}, got ${gridSize}`
    );
  }
  return {
    gamePhase: GamePhase.NOT_STARTED,
    movesLeft: MOVES_PER_TURN,
    redVirusCellCodes: [],
    blueVirusCellCodes: [],
    redColonySets: [],
    blueColonySets: [],
    availableCellCodes: [],
    gridSize,
    loser: null,
    firstMoveDone: { red: false, blue: false },
  };
}

/** Moves a NOT_STARTED game to red's first turn. Any other state is returned unchanged. */
export function startGame(state: IGameState): IGameState {
  if (state.gamePhase !== GamePhase.NOT_STARTED) return state;
  const started: IGameState = {
    ...cloneState(state),
    gamePhase: GamePhase.RED_TURN,
    movesLeft: MOVES_PER_TURN,
  };
  started.availableCellCodes = getAvailableCellCodes(started, 'red');
  return started;
}

/**
 * Applies one action of `side` on `cellCode`. Pure: `state` is never mutated and the result
 * shares no references with it.
 */
export function applyMove(state: IGameState, side: Side, cellCode: string): MoveResult {
  const me = sideKey(side);

  const mover = phaseSide(state.gamePhase);
  if (mover === null) return { ok: false, reason: 'GAME_NOT_ACTIVE' };
  if (mover !== me) return { ok: false, reason: 'NOT_YOUR_TURN' };
  if (!isValidCellCode(cellCode, state.gridSize)) return { ok: false, reason: 'INVALID_CELL' };
  if (!getAvailableCellCodes(state, me).includes(cellCode)) {
    return { ok: false, reason: 'CELL_NOT_AVAILABLE' };
  }

  const next = cloneState(state);
  const enemy = opponentOf(me);
  const touches = (colony: IColonySet, neighbours: Set<string>) =>
    colony.colonyCellsCodes.some((code) => neighbours.has(code));
  const neighbours = new Set(getAdjacentCellCodes(cellCode, next.gridSize));

  const myColonies = coloniesOf(next, me);

  if (getCellType(state, cellCode) === null) {
    // Empty cell -> own virus; touching own inactive colonies wake up.
    virusesOf(next, me).push(cellCode);
    for (const colony of myColonies) {
      if (touches(colony, neighbours)) colony.activated = true;
    }
  } else {
    // Enemy virus -> becomes a permanent cell of an own colony.
    const enemyViruses = virusesOf(next, enemy);
    enemyViruses.splice(enemyViruses.indexOf(cellCode), 1);

    const adjacentMine = myColonies.filter((colony) => touches(colony, neighbours));
    if (adjacentMine.length === 0) {
      myColonies.push({
        id: nextColonyId(next),
        colonyCellsCodes: [cellCode],
        activated: true,
        owner: toPlayerType(me),
      });
    } else {
      const [main, ...merged] = adjacentMine;
      main.colonyCellsCodes.push(cellCode);
      main.activated = true;
      for (const colony of merged) {
        main.colonyCellsCodes.push(...colony.colonyCellsCodes);
        myColonies.splice(myColonies.indexOf(colony), 1);
      }
    }

    // Enemy colonies next to the captured cell may have lost their last supporting virus.
    for (const colony of coloniesOf(next, enemy)) {
      if (
        colony.activated &&
        touches(colony, neighbours) &&
        !hasAdjacentVirus(colony, enemyViruses, next.gridSize)
      ) {
        colony.activated = false;
      }
    }
  }

  next.firstMoveDone[me] = true;
  next.movesLeft = state.movesLeft - 1;
  if (next.movesLeft <= 0) {
    next.gamePhase = turnPhaseOf(enemy);
    next.movesLeft = MOVES_PER_TURN;
  }

  // Whoever has to act next but cannot, loses.
  const nextMover = phaseSide(next.gamePhase) as 'red' | 'blue';
  next.availableCellCodes = getAvailableCellCodes(next, nextMover);
  if (next.availableCellCodes.length === 0) {
    next.gamePhase = GamePhase.GAME_OVER;
    next.loser = toPlayerType(nextMover);
  }

  return { ok: true, state: next };
}

function cloneState(state: IGameState): IGameState {
  const cloneColonies = (colonies: IColonySet[]): IColonySet[] =>
    colonies.map((colony) => ({ ...colony, colonyCellsCodes: [...colony.colonyCellsCodes] }));
  return {
    ...state,
    redVirusCellCodes: [...state.redVirusCellCodes],
    blueVirusCellCodes: [...state.blueVirusCellCodes],
    redColonySets: cloneColonies(state.redColonySets),
    blueColonySets: cloneColonies(state.blueColonySets),
    availableCellCodes: [...state.availableCellCodes],
    firstMoveDone: { ...state.firstMoveDone },
  };
}

/** Max existing colony id (both sides) + 1. No module-level counter: the server hosts many games. */
function nextColonyId(state: IGameState): number {
  let max = 0;
  for (const colony of [...state.redColonySets, ...state.blueColonySets]) {
    if (colony.id > max) max = colony.id;
  }
  return max + 1;
}

function hasAdjacentVirus(colony: IColonySet, viruses: string[], gridSize: number): boolean {
  const virusSet = new Set(viruses);
  return colony.colonyCellsCodes.some((code) =>
    getAdjacentCellCodes(code, gridSize).some((neighbour) => virusSet.has(neighbour))
  );
}
