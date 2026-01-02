import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";
import { ColonySet } from "../../classes/ColonySet";
import { calculateAvailableCellCodes } from "../helpers/cellsGetters";
import { checkColonyIsActive } from "../helpers/checkColonyActivation";
import {
  addNewDeleteOldColonies,
  refreshColonySets,
} from "../helpers/cellsUpdater";
import { getAdjacentColonies } from "../helpers/getAdjacentColonies";

export function actionAddCellToColony(
  cellCode: string,
  state: GameState
): GameState {
  // 1. Prepare new state
  const newState: GameState = {
    ...state,
  };
  const { adjacentRedColonies, adjacentBlueColonies } = getAdjacentColonies(
    cellCode,
    state
  );
  const adjacentEnemyColonies =
    state.currentPlayer === PlayerType.RED
      ? adjacentBlueColonies
      : adjacentRedColonies;
  const adjacentFriendlyColonies =
    state.currentPlayer === PlayerType.RED
      ? adjacentRedColonies
      : adjacentBlueColonies;
  const enemyVirusCellCodes =
    state.currentPlayer === PlayerType.RED
      ? newState.blueVirusCellCodes
      : newState.redVirusCellCodes;

  // 2. Enemy - remove virus cell
  if (state.currentPlayer === PlayerType.RED) {
    const updatedEnemyVirusCodes = state.blueVirusCellCodes.filter(
      (code: string) => code !== cellCode
    );
    newState.blueVirusCellCodes = updatedEnemyVirusCodes;
  } else {
    const updatedEnemyVirusCodes = state.redVirusCellCodes.filter(
      (code: string) => code !== cellCode
    );
    newState.redVirusCellCodes = updatedEnemyVirusCodes;
  }

  // 3. Enemy adjacent colonies - check for deactivation and update if needed
  const toUpdateColonies: ColonySet[] = [];
  adjacentEnemyColonies.forEach((colony) => {
    if (colony.activated) {
      const active = checkColonyIsActive(colony, enemyVirusCellCodes);
      if (!active) {
        colony.activated = false;
        toUpdateColonies.push(colony);
      }
    }
  });
  refreshColonySets(newState, toUpdateColonies);

  // 4. Target adjacent colonies - if there is no adjacent colony, create a new one
  if (adjacentFriendlyColonies.length === 0) {
    const newColonySet = new ColonySet(
      new Set([cellCode]),
      true,
      state.currentPlayer
    );

    if (state.currentPlayer === PlayerType.RED) {
      newState.redColonySets = [...newState.redColonySets, newColonySet];
    } else {
      newState.blueColonySets = [...newState.blueColonySets, newColonySet];
    }

    // 5. If there is one adjacent colony - add cell to it
  } else if (adjacentFriendlyColonies.length === 1) {
    // Add to existing colony
    const mainSet = adjacentFriendlyColonies[0];
    mainSet.addCellCodes([cellCode]);
    mainSet.activated = true;
    refreshColonySets(newState, [mainSet]);

    // 6. If there are more than one adjacent colonies - merge them into main one
  } else {
    // Merge colonies
    const mainColony = adjacentFriendlyColonies[0];
    mainColony.addCellCodes([cellCode]);
    mainColony.activated = true;
    for (let i = 1; i < adjacentFriendlyColonies.length; i++) {
      const adjColony = adjacentFriendlyColonies[i];
      mainColony.addCellCodes(adjColony.getCellCodes());
    }
    addNewDeleteOldColonies(
      newState,
      adjacentFriendlyColonies,
      [mainColony],
      state.currentPlayer
    );
  }
  newState.availableCellCodes = calculateAvailableCellCodes(newState);
  return newState;
}
