import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";
import { helperGetAdjacentCellCodes } from "../helpers/getAdjacentCellCodes";
import { ColonySet } from "../../classes/ColonySet";


export function actionAddCellToColony(
  cellCode: string,
  player: PlayerType,
  state: GameState
): GameState {
  const adjacentCellCodes = helperGetAdjacentCellCodes(cellCode, {
    redVirusCellCodes: state.redVirusCellCodes,
    blueVirusCellCodes: state.blueVirusCellCodes,
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

    if (player === PlayerType.RED) {
      return {
        ...state,
        redColonySets: [...state.redColonySets, newColonySet],
      };
    } else {
      return {
        ...state,
        blueColonySets: [...state.blueColonySets, newColonySet],
      };
    }
  } else if (adjacentColonySets.size === 1) {
    // Add to existing colony
    const mainSet = Array.from(adjacentColonySets)[0];
    mainSet.addCellCodes([cellCode]);
    mainSet.activated = true;

    if (player === PlayerType.RED) {
      return {
        ...state,
        redColonySets: [
          ...state.redColonySets.filter((item: ColonySet) => item !== mainSet),
          mainSet.clone(),
        ],
      };
    } else {
      return {
        ...state,
        blueColonySets: [
          ...state.blueColonySets.filter((item: ColonySet) => item !== mainSet),
          mainSet.clone(),
        ],
      };
    }
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

    if (player === PlayerType.RED) {
      return {
        ...state,
        redColonySets: [
          ...state.redColonySets.filter(
            (item: ColonySet) => !adjacentColonySets.has(item)
          ),
          mainSet.clone(),
        ],
      };
    } else {
      return {
        ...state,
        blueColonySets: [
          ...state.blueColonySets.filter(
            (item: ColonySet) => !adjacentColonySets.has(item)
          ),
          mainSet.clone(),
        ],
      };
    }
  }
}
