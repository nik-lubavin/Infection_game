import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";
import { getAdjacentCellCodes } from "../helpers/getAdjacentCellCodes";
import { ColonySet } from "../../classes/ColonySet";
import { getAvailableCellCodes } from "../helpers/getAvailableCellCodes";
import { checkColonyIsActive } from "../helpers/checkColonyActivation";
import {
  addNewDeleteOldColonies,
  substituteColonySets,
} from "../helpers/partiallyUpdateColonySets";

export function actionAddCellToColony(
  cellCode: string,
  player: PlayerType,
  state: GameState
): GameState {
  // 0 Prepare new state
  const newState: GameState = {
    ...state,
  };

  // 1. Enemy - remove virus cell
  if (player === PlayerType.RED) {
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

  // 2. Gather adjacent colonies data
  const allAdjacentCellCodes = getAdjacentCellCodes(cellCode);
  const adjacentRedColonies: ColonySet[] = [];
  const adjacentBlueColonies: ColonySet[] = [];
  allAdjacentCellCodes.forEach((adjacentCellCode) => {
    const foundRedColonySet = state.redColonySets.find((item: ColonySet) =>
      item.colonyCellsCodes.has(adjacentCellCode)
    );
    if (foundRedColonySet) {
      adjacentRedColonies.push(foundRedColonySet);
    }

    const foundBlueColonySet = state.blueColonySets.find((item: ColonySet) =>
      item.colonyCellsCodes.has(adjacentCellCode)
    );
    if (foundBlueColonySet) {
      adjacentBlueColonies.push(foundBlueColonySet);
    }
  });
  const adjacentEnemyColonies =
    player === PlayerType.RED ? adjacentBlueColonies : adjacentRedColonies;
  const adjacentTargetColonies =
    player === PlayerType.RED ? adjacentRedColonies : adjacentBlueColonies;
  const enemyVirusCellCodes =
    player === PlayerType.RED
      ? newState.blueVirusCellCodes
      : newState.redVirusCellCodes;

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
  substituteColonySets(newState, toUpdateColonies, player);

  // 4. Target adjacent colonies - if there is no adjacent colony, create a new one
  if (adjacentTargetColonies.length === 0) {
    const newColonySet = new ColonySet(new Set([cellCode]), player, true);
    // TODO is this new colony mergeable?

    if (player === PlayerType.RED) {
      newState.redColonySets = [...newState.redColonySets, newColonySet];
    } else {
      newState.blueColonySets = [...newState.blueColonySets, newColonySet];
    }

    // 5. If there is one adjacent colony - add cell to it
  } else if (adjacentTargetColonies.length === 1) {
    // Add to existing colony
    const mainSet = adjacentTargetColonies[0];
    mainSet.addCellCodes([cellCode]);
    mainSet.activated = true;
    substituteColonySets(newState, [mainSet], player);

    // 6. If there are more than one adjacent colonies - merge them into main one
  } else {
    // Merge colonies
    const mainColony = adjacentTargetColonies[0];
    mainColony.addCellCodes([cellCode]);
    mainColony.activated = true;
    for (let i = 1; i < adjacentTargetColonies.length; i++) {
      const adjColony = adjacentTargetColonies[i];
      mainColony.addCellCodes(adjColony.getCellCodes());
    }
    addNewDeleteOldColonies(
      newState,
      adjacentTargetColonies,
      [mainColony],
      player
    );
  }
  newState.availableCellCodes = getAvailableCellCodes(newState);
  return newState;
}
