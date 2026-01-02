import { ColonySet } from "../../classes/ColonySet";
import { CellType } from "../../enums/CellType";
import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";
import { getAdjacentCellCodes } from "./getAdjacentCellCodes";

export function calculateAvailableCellCodes(state: GameState): string[] {
  const virusContainer =
    state.currentPlayer === PlayerType.RED
      ? state.redVirusCellCodes
      : state.blueVirusCellCodes;

  const colonyContainer =
    state.currentPlayer === PlayerType.RED
      ? state.redColonySets
      : state.blueColonySets;
  const enemyVirusType =
    state.currentPlayer === PlayerType.RED
      ? CellType.BLUE_VIRUS
      : CellType.RED_VIRUS;

  const result: Set<string> = new Set();

  // Check virus cells
  virusContainer.forEach((virusCellCode: string) => {
    const adjacentVirusCellCodes = getAdjacentCellCodes(virusCellCode);
    adjacentVirusCellCodes.forEach((cellCode: string) => {
      const cellType = getCellType(cellCode, state);
      if (!cellType || cellType === enemyVirusType) {
        result.add(cellCode);
      }
    });
  });

  // Check colony cells
  colonyContainer
    .filter((colonySet: ColonySet) => colonySet.activated)
    .forEach((colonySet: ColonySet) => {
      colonySet.getCellCodes().forEach((cellCode: string) => {
        const adjacentColonyCellCodes = getAdjacentCellCodes(cellCode);
        adjacentColonyCellCodes.forEach((cellCode: string) => {
          const cellType = getCellType(cellCode, state);
          if (!cellType || cellType === enemyVirusType) {
            result.add(cellCode);
          }
        });
      });
    });

  return Array.from(result);
}

export function getCellColonySet(
  cellCode: string,
  state: GameState
): ColonySet | null {
  const redColonySet = state.redColonySets.find((set) =>
    set.colonyCellsCodes.has(cellCode)
  );
  if (redColonySet) {
    return redColonySet;
  }

  const blueColonySet = state.blueColonySets.find((set) =>
    set.colonyCellsCodes.has(cellCode)
  );
  if (blueColonySet) {
    return blueColonySet;
  }

  return null;
}

export function isCellAvailable(cellCode: string, state: GameState): boolean {
  return state.availableCellCodes.some((item) => item === cellCode);
}

export function getCellType(
  cellCode: string,
  state: GameState
): CellType | null {
  if (state.redVirusCellCodes.includes(cellCode)) {
    return CellType.RED_VIRUS;
  } else if (state.blueVirusCellCodes.includes(cellCode)) {
    return CellType.BLUE_VIRUS;
  }

  const redColonySet = state.redColonySets.find((set: ColonySet) =>
    set.colonyCellsCodes.has(cellCode)
  );
  if (redColonySet) {
    return redColonySet.activated
      ? CellType.RED_COLONY_ACTIVE
      : CellType.RED_COLONY_INACTIVE;
  }

  const blueColonySet = state.blueColonySets.find((set: ColonySet) =>
    set.colonyCellsCodes.has(cellCode)
  );
  if (blueColonySet) {
    return blueColonySet.activated
      ? CellType.BLUE_COLONY_ACTIVE
      : CellType.BLUE_COLONY_INACTIVE;
  }

  return null;
}
