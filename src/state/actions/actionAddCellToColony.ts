import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";
import { getAdjacentCellCodes } from "../helpers/getAdjacentCellCodes";
import { ColonySet } from "../../classes/ColonySet";
import { getAvailableCellCodes } from "../helpers/getAvailableCellCodes";
import { checkColonyIsActive } from "../helpers/checkColonyActivation";

export function actionAddCellToColony(
  cellCode: string,
  player: PlayerType,
  state: GameState
): GameState {
  // Prepare new state
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
        toUpdateColonies.push(colony.clone());
      }
    }
  });
  const enemyColonySets =
    player === PlayerType.RED
      ? newState.blueColonySets
      : newState.redColonySets;
  const updated = enemyColonySets.filter(
    (colony) => !toUpdateColonies.includes(colony)
  );
  updated.push(...toUpdateColonies);
  if (player === PlayerType.RED) {
    newState.blueColonySets = updated;
  } else {
    newState.redColonySets = updated;
  }

  // 4. Target adjacent colonies - if there is no adjacent colony, create a new one
  if (adjacentTargetColonies.length === 0) {
    const newColonySet = new ColonySet(new Set([cellCode]), player, true);

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
    if (player === PlayerType.RED) {
      // Clone mainSet and re-add to redColonySets
      const updatedRedColonySets = newState.redColonySets.filter(
        (item: ColonySet) => item !== mainSet
      );
      updatedRedColonySets.push(mainSet.clone());
      newState.redColonySets = updatedRedColonySets;
    } else {
      // Clone mainSet and re-add to blueColonySets
      const updatedBlueColonySets = newState.blueColonySets.filter(
        (item: ColonySet) => item !== mainSet
      );
      updatedBlueColonySets.push(mainSet.clone());
    }

    // 6. If there are more than one adjacent colonies - merge them into main one
  } else {
    // Merge colonies
    const mainColony = adjacentTargetColonies[0];
    mainColony.addCellCodes([cellCode]);
    mainColony.activated = true;

    let updatedColonySets: ColonySet[] = [];
    if (player === PlayerType.RED) {
      updatedColonySets = newState.redColonySets.filter(
        (item) => !adjacentTargetColonies.includes(item)
      );
      updatedColonySets.push(mainColony);
      newState.redColonySets = updatedColonySets;
    } else {
      updatedColonySets = newState.blueColonySets.filter(
        (item) => !adjacentTargetColonies.includes(item)
      );
      updatedColonySets.push(mainColony);
      newState.blueColonySets = updatedColonySets;
    }
  }
  newState.availableCellCodes = getAvailableCellCodes(newState);
  return newState;
}
