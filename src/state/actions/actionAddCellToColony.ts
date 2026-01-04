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
  const { adjacentRedColonies, adjacentBlueColonies } = getAdjacentColonies(
    cellCode,
    state
  );
  const adjacentEnemyColonies =
    state.gamePhase === PlayerType.RED
      ? adjacentBlueColonies
      : adjacentRedColonies;
  const adjacentFriendlyColonies =
    state.gamePhase === PlayerType.RED
      ? adjacentRedColonies
      : adjacentBlueColonies;

  // 1. Enemy - remove virus cell
  let newState: GameState = {
    ...state,
    blueVirusCellCodes:
      state.gamePhase === PlayerType.RED
        ? state.blueVirusCellCodes.filter((code: string) => code !== cellCode)
        : state.blueVirusCellCodes,
    redVirusCellCodes:
      state.gamePhase === PlayerType.BLUE
        ? state.redVirusCellCodes.filter((code: string) => code !== cellCode)
        : state.redVirusCellCodes,
  };

  const enemyVirusCellCodes =
    state.gamePhase === PlayerType.RED
      ? newState.blueVirusCellCodes
      : newState.redVirusCellCodes;

  // 2. Enemy adjacent colonies - check for deactivation and update if needed
  const toUpdateColonies: ColonySet[] = [];
  adjacentEnemyColonies.forEach((colony) => {
    if (colony.activated) {
      const active = checkColonyIsActive(colony, enemyVirusCellCodes);
      if (!active) {
        // Clone and modify - refreshColonySets will handle replacing it
        const clonedColony = colony.clone();
        clonedColony.activated = false;
        toUpdateColonies.push(clonedColony);
      }
    }
  });
  if (toUpdateColonies.length > 0) {
    newState = refreshColonySets(newState, toUpdateColonies);
  }

  // 3. Friendly adjacent colonies - if there is no adjacent colony, create a new one
  if (adjacentFriendlyColonies.length === 0) {
    const newColonySet = new ColonySet(
      new Set([cellCode]),
      true,
      state.gamePhase as PlayerType
    );

    newState = {
      ...newState,
      redColonySets:
        state.gamePhase === PlayerType.RED
          ? [...newState.redColonySets, newColonySet]
          : newState.redColonySets,
      blueColonySets:
        state.gamePhase === PlayerType.BLUE
          ? [...newState.blueColonySets, newColonySet]
          : newState.blueColonySets,
    };

    // 4. If there is one adjacent colony - add cell to it
  } else if (adjacentFriendlyColonies.length === 1) {
    // Clone, modify, and update - refreshColonySets will handle replacing it
    const mainSet = adjacentFriendlyColonies[0].clone();
    mainSet.addCellCodes([cellCode]);
    mainSet.activated = true;
    newState = refreshColonySets(newState, [mainSet]);

    // 5. If there are more than one adjacent colonies - merge them into main one
  } else {
    // Merge colonies - clone, modify, and update
    const mainColony = adjacentFriendlyColonies[0].clone();
    mainColony.addCellCodes([cellCode]);
    mainColony.activated = true;
    for (let i = 1; i < adjacentFriendlyColonies.length; i++) {
      const adjColony = adjacentFriendlyColonies[i];
      mainColony.addCellCodes(adjColony.getCellCodes());
    }
    newState = addNewDeleteOldColonies(
      newState,
      adjacentFriendlyColonies,
      [mainColony],
    );
  }

  newState = {
    ...newState,
    availableCellCodes: calculateAvailableCellCodes(newState),
  };
  return newState;
}
