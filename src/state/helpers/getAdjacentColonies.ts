import { IColonySet, IGameState } from '@infection-game/shared';
import { getAdjacentCellCodes } from './getAdjacentCellCodes';

export function getAdjacentColonies(cellCode: string, state: IGameState) {
  const allAdjacentCellCodes = getAdjacentCellCodes(cellCode);
  const adjacentRedColonies: IColonySet[] = [];
  const adjacentBlueColonies: IColonySet[] = [];
  allAdjacentCellCodes.forEach((adjacentCellCode) => {
    const foundRedColonySet = state.redColonySets.find((colSet: IColonySet) =>
      colSet.colonyCellsCodes.has(adjacentCellCode)
    );
    if (foundRedColonySet) {
      adjacentRedColonies.push(foundRedColonySet);
    }
    const foundBlueColonySet = state.blueColonySets.find((colSet: IColonySet) =>
      colSet.colonyCellsCodes.has(adjacentCellCode)
    );
    if (foundBlueColonySet) {
      adjacentBlueColonies.push(foundBlueColonySet);
    }
  });

  return { adjacentRedColonies, adjacentBlueColonies };
}
