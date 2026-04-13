import { ColonySet } from '../../classes/ColonySet';
import { IGameState } from '@infection-game/shared';
import { getAdjacentCellCodes } from './getAdjacentCellCodes';

export function getAdjacentColonies(cellCode: string, state: IGameState) {
  const allAdjacentCellCodes = getAdjacentCellCodes(cellCode);
  const adjacentRedColonies: ColonySet[] = [];
  const adjacentBlueColonies: ColonySet[] = [];
  allAdjacentCellCodes.forEach((adjacentCellCode) => {
    // const foundRedColonySet = state.redColonySets.find((item: ColonySet) =>
    //   item.colonyCellsCodes.has(adjacentCellCode)
    // );
    // if (foundRedColonySet) {
    //   adjacentRedColonies.push(foundRedColonySet);
    // }
    // const foundBlueColonySet = state.blueColonySets.find((item: ColonySet) =>
    //   item.colonyCellsCodes.has(adjacentCellCode)
    // );
    // if (foundBlueColonySet) {
    //   adjacentBlueColonies.push(foundBlueColonySet);
    // }
  });

  return { adjacentRedColonies, adjacentBlueColonies };
}
