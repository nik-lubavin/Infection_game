// import { ColonySet } from '../../classes/ColonySet';
import { GRID_SIZE } from '../../constants/board';
import { CellType } from '../../enums/CellType';
import { GamePhase, IColonySet, IGameState } from '@infection-game/shared';
import { getAdjacentCellCodes } from './getAdjacentCellCodes';

export function calculateAvailableCellCodes(state: IGameState): string[] {
  const virusContainer =
    state.gamePhase === GamePhase.RED_TURN ? state.redVirusCellCodes : state.blueVirusCellCodes;

  const colonyContainer =
    state.gamePhase === GamePhase.RED_TURN ? state.redColonySets : state.blueColonySets;
  const enemyVirusType =
    state.gamePhase === GamePhase.RED_TURN ? CellType.BLUE_VIRUS : CellType.RED_VIRUS;

  const result: Set<string> = new Set();

  // Check virus cells
  if (!virusContainer.length) {
    if (state.gamePhase === GamePhase.RED_TURN) {
      result.add('0-0');
    } else {
      result.add(`${GRID_SIZE - 1}-${GRID_SIZE - 1}`);
    }

    return Array.from(result);
  }

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
    .filter((colonySet: IColonySet) => colonySet.activated)
    .forEach((colonySet: IColonySet) => {
      colonySet.colonyCellsCodes.forEach((cellCode: string) => {
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

export function getCellColonySet(cellCode: string, state: IGameState): IColonySet | null {
  // const redColonySet = state.redColonySets.find((set: ColonySet) =>
  //   set.colonyCellsCodes.has(cellCode)
  // );
  // if (redColonySet) {
  //   return redColonySet;
  // }

  // const blueColonySet = state.blueColonySets.find((set: ColonySet) =>
  //   set.colonyCellsCodes.has(cellCode)
  // );
  // if (blueColonySet) {
  //   return blueColonySet;
  // }

  return null;
}

export function isCellAvailable(cellCode: string, state: IGameState): boolean {
  return false;
  // return state.availableCellCodes.some((item) => item === cellCode);
}

export function getCellType(cellCode: string, state: IGameState): CellType | null {
  if (state.redVirusCellCodes.includes(cellCode)) {
    return CellType.RED_VIRUS;
  } else if (state.blueVirusCellCodes.includes(cellCode)) {
    return CellType.BLUE_VIRUS;
  }

  // const redColonySet = state.redColonySets.find((set: ColonySet) =>
  //   set.colonyCellsCodes.has(cellCode)
  // );
  // if (redColonySet) {
  //   return redColonySet.activated ? CellType.RED_COLONY_ACTIVE : CellType.RED_COLONY_INACTIVE;
  // }

  // const blueColonySet = state.blueColonySets.find((set: ColonySet) =>
  //   set.colonyCellsCodes.has(cellCode)
  // );
  // if (blueColonySet) {
  //   return blueColonySet.activated ? CellType.BLUE_COLONY_ACTIVE : CellType.BLUE_COLONY_INACTIVE;
  // }

  return null;
}
