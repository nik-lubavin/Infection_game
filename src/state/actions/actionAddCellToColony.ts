import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";
import { helperGetAdjacentCellCodes } from "../helpers/getAdjacentCellCodes";
import { ColonySet } from "../../classes/ColonySet";
import { getAvailableCellCodes } from "../helpers/getAvailableCellCodes";


export function actionAddCellToColony(
  cellCode: string,
  player: PlayerType,
  state: GameState
): GameState {
  const adjacentCellCodes = helperGetAdjacentCellCodes(cellCode, {
    redVirusCellCodes: new Set(state.redVirusCellCodes),
    blueVirusCellCodes: new Set(state.blueVirusCellCodes),
    redColonySets: state.redColonySets,
    blueColonySets: state.blueColonySets,
  });
  const adjacentColonySets: Set<ColonySet> = new Set();

  // Find adjacent colony sets
  const colonyContainer =
    player === PlayerType.RED ? state.redColonySets : state.blueColonySets;

  adjacentCellCodes.forEach((adjacentCellCode) => {
    const colonySet = colonyContainer.find((item: ColonySet) =>
      item.colonyCellsCodes.has(adjacentCellCode)
    );
    if (colonySet) {
      adjacentColonySets.add(colonySet);
    }
  });

  if (adjacentColonySets.size === 0) {
    // Create new colony
    const newColonySet = new ColonySet(new Set([cellCode]), player, true);

    // Remove the cell from enemy's virus list if it was an enemy virus
    const enemyVirusKey = player === PlayerType.RED ? "blueVirusCellCodes" : "redVirusCellCodes";
    const updatedEnemyVirusCodes = state[enemyVirusKey].filter((code: string) => code !== cellCode);

    const newState = player === PlayerType.RED
      ? {
          ...state,
          redColonySets: [...state.redColonySets, newColonySet],
          blueVirusCellCodes: updatedEnemyVirusCodes,
        }
      : {
          ...state,
          blueColonySets: [...state.blueColonySets, newColonySet],
          redVirusCellCodes: updatedEnemyVirusCodes,
        };
    
    newState.availableCellCodes = getAvailableCellCodes(newState);
    return newState;
  } else if (adjacentColonySets.size === 1) {
    // Add to existing colony
    const mainSet = Array.from(adjacentColonySets)[0];
    mainSet.addCellCodes([cellCode]);
    mainSet.activated = true;

    // Remove the cell from enemy's virus list if it was an enemy virus
    const enemyVirusKey = player === PlayerType.RED ? "blueVirusCellCodes" : "redVirusCellCodes";
    const updatedEnemyVirusCodes = state[enemyVirusKey].filter((code: string) => code !== cellCode);

    const newState = player === PlayerType.RED
      ? {
          ...state,
          redColonySets: [
            ...state.redColonySets.filter((item: ColonySet) => item !== mainSet),
            mainSet.clone(),
          ],
          blueVirusCellCodes: updatedEnemyVirusCodes,
        }
      : {
          ...state,
          blueColonySets: [
            ...state.blueColonySets.filter((item: ColonySet) => item !== mainSet),
            mainSet.clone(),
          ],
          redVirusCellCodes: updatedEnemyVirusCodes,
        };
    
    newState.availableCellCodes = getAvailableCellCodes(newState);
    return newState;
  } else {
    // Merge colonies
    const colonySetsArray = Array.from(adjacentColonySets);
    const mainSet = colonySetsArray[0];
    mainSet.addCellCodes([cellCode]);

    for (let i = 1; i < colonySetsArray.length; i++) {
      const current = colonySetsArray[i];
      mainSet.addCellCodes(current.getCellCodes());
    }

    mainSet.activated = true;

    // Remove the cell from enemy's virus list if it was an enemy virus
    const enemyVirusKey = player === PlayerType.RED ? "blueVirusCellCodes" : "redVirusCellCodes";
    const updatedEnemyVirusCodes = state[enemyVirusKey].filter((code: string) => code !== cellCode);

    const newState = player === PlayerType.RED
      ? {
          ...state,
          redColonySets: [
            ...state.redColonySets.filter(
              (item: ColonySet) => !adjacentColonySets.has(item)
            ),
            mainSet.clone(),
          ],
          blueVirusCellCodes: updatedEnemyVirusCodes,
        }
      : {
          ...state,
          blueColonySets: [
            ...state.blueColonySets.filter(
              (item: ColonySet) => !adjacentColonySets.has(item)
            ),
            mainSet.clone(),
          ],
          redVirusCellCodes: updatedEnemyVirusCodes,
        };
    
    newState.availableCellCodes = getAvailableCellCodes(newState);
    return newState;
  }
}
