import { GamePhase, IGameState } from '@infection-game/shared';
import { getAdjacentColonies } from '../helpers/getAdjacentColonies';
import { calculateAvailableCellCodes } from '../helpers/cellsGetters';

export function actionAddVirusCell(cellCode: string, state: IGameState): IGameState {
  // 1. Add virus cell to player
  let newState: IGameState = {
    ...state,
    redVirusCellCodes: [...state.redVirusCellCodes, cellCode],
    blueVirusCellCodes: [...state.blueVirusCellCodes, cellCode],
  };

  // 2. Check possible colony activation (for inactive)
  const { adjacentRedColonies, adjacentBlueColonies } = getAdjacentColonies(cellCode, state);
  const adjacentFriendlyColonies =
    state.gamePhase === GamePhase.RED_TURN ? adjacentRedColonies : adjacentBlueColonies;
  const inactive = adjacentFriendlyColonies.filter((colon) => !colon.activated);
  if (inactive.length > 0) {
    // Clone colonies before modifying to avoid mutating original state
    // FIXME
    // const toUpdate: ColonySet[] = inactive.map((colony) => {
    //   const cloned = colony.clone();
    //   cloned.activated = true;
    //   return cloned;
    // });
    // newState = refreshColonySets(newState, toUpdate);
  }

  newState = {
    ...newState,
    availableCellCodes: calculateAvailableCellCodes(newState),
  };

  return newState;
}
