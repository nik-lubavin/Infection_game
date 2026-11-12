import { CellType, type IColonySet, type IGameState } from '../types/index.js';
import { getAdjacentCellCodes, getCornerCellCode, parseCellCode } from './board.js';
import { opponentOf, sideKey, type Side } from './sides.js';

export function virusesOf(state: IGameState, side: Side): string[] {
  return sideKey(side) === 'red' ? state.redVirusCellCodes : state.blueVirusCellCodes;
}

export function coloniesOf(state: IGameState, side: Side): IColonySet[] {
  return sideKey(side) === 'red' ? state.redColonySets : state.blueColonySets;
}

function colonyType(colony: IColonySet, side: Side): CellType {
  if (sideKey(side) === 'red') {
    return colony.activated ? CellType.RED_COLONY_ACTIVE : CellType.RED_COLONY_INACTIVE;
  }
  return colony.activated ? CellType.BLUE_COLONY_ACTIVE : CellType.BLUE_COLONY_INACTIVE;
}

function indexCellTypes(state: IGameState): Map<string, CellType> {
  const types = new Map<string, CellType>();
  for (const code of state.redVirusCellCodes) types.set(code, CellType.RED_VIRUS);
  for (const code of state.blueVirusCellCodes) types.set(code, CellType.BLUE_VIRUS);
  for (const side of ['red', 'blue'] as const) {
    for (const colony of coloniesOf(state, side)) {
      for (const code of colony.colonyCellsCodes) types.set(code, colonyType(colony, side));
    }
  }
  return types;
}

/** What occupies the cell, or null if it is empty (or not a valid code). */
export function getCellType(state: IGameState, cellCode: string): CellType | null {
  if (parseCellCode(cellCode) === null) return null;
  return indexCellTypes(state).get(cellCode) ?? null;
}

function compareCellCodes(a: string, b: string): number {
  const pa = parseCellCode(a);
  const pb = parseCellCode(b);
  if (!pa || !pb) return a < b ? -1 : a > b ? 1 : 0;
  return pa.row - pb.row || pa.col - pb.col;
}

/**
 * Cells the side may act on right now, sorted by row then column.
 *
 * - Before the side's first action: only its own corner (and only if that cell is empty).
 * - Afterwards: empty cells or enemy viruses next to any own virus or next to a cell of an
 *   own ACTIVE colony. Colony cells are never available.
 *
 * Does not look at whose turn it is.
 */
export function getAvailableCellCodes(state: IGameState, side: Side): string[] {
  const me = sideKey(side);
  const types = indexCellTypes(state);

  if (!state.firstMoveDone[me]) {
    const corner = getCornerCellCode(me, state.gridSize);
    return types.has(corner) ? [] : [corner];
  }

  const enemyVirusType = opponentOf(me) === 'red' ? CellType.RED_VIRUS : CellType.BLUE_VIRUS;
  const result = new Set<string>();
  const addNeighbours = (cellCode: string) => {
    for (const neighbour of getAdjacentCellCodes(cellCode, state.gridSize)) {
      const type = types.get(neighbour);
      if (type === undefined || type === enemyVirusType) result.add(neighbour);
    }
  };

  virusesOf(state, me).forEach(addNeighbours);
  for (const colony of coloniesOf(state, me)) {
    if (colony.activated) colony.colonyCellsCodes.forEach(addNeighbours);
  }
  return Array.from(result).sort(compareCellCodes);
}
