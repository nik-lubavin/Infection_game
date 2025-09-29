import { GameState, GameAction } from "./gameState";
import { Board } from "../classes/Board";
import { ColonySet } from "../classes/ColonySet";
import { PlayerType } from "../interfaces/Board";
// import { CellType } from "../enums/CellType";
import { GRID_SIZE } from "../constants/board";

// Initial virus positions
const initialRedViruses = ["0-0", "1-1", "2-2", "3-3", "4-4", "5-5"];
const initialBlueViruses = ["9-9", "8-8", "7-7", "6-6", "5-6", "6-5"];

// Helper function to get adjacent cell codes
function getAdjacentCellCodes(cellCode: string): string[] {
  const [rowStr, colStr] = cellCode.split("-");
  const row = parseInt(rowStr);
  const col = parseInt(colStr);

  const adjacent: string[] = [];

  // Check all 8 directions
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue; // Skip the cell itself

      const newRow = row + dr;
      const newCol = col + dc;

      // Check bounds
      if (
        newRow >= 0 &&
        newRow < GRID_SIZE &&
        newCol >= 0 &&
        newCol < GRID_SIZE
      ) {
        adjacent.push(`${newRow}-${newCol}`);
      }
    }
  }

  return adjacent;
}

// Helper function to get cell type (for future use)
// function getCellType(cellCode: string, state: GameState): CellType | null {
//   if (state.redVirusCellCodes.has(cellCode)) {
//     return CellType.RED_VIRUS;
//   } else if (state.blueVirusCellCodes.has(cellCode)) {
//     return CellType.BLUE_VIRUS;
//   } else {
//     const redColonySet = state.redColonySets.find((set) =>
//       set.colonyCellsCodes.has(cellCode)
//     );
//     if (redColonySet) {
//       return redColonySet.activated
//         ? CellType.RED_COLONY_ACTIVE
//         : CellType.RED_COLONY_INACTIVE;
//     }

//     const blueColonySet = state.blueColonySets.find((set) =>
//       set.colonyCellsCodes.has(cellCode)
//     );
//     if (blueColonySet) {
//       return blueColonySet.activated
//         ? CellType.BLUE_COLONY_ACTIVE
//         : CellType.BLUE_COLONY_INACTIVE;
//     }

//     return null;
//   }
// }

// Helper function to add cell to colony
function addCellToColony(
  cellCode: string,
  player: PlayerType,
  state: GameState
): GameState {
  const adjacentCellCodes = getAdjacentCellCodes(cellCode);
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

// Main reducer function
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "INITIALIZE_GAME": {
      const newState = {
        ...state,
        board: new Board(GRID_SIZE, GRID_SIZE),
        redVirusCellCodes: new Set(initialRedViruses),
        blueVirusCellCodes: new Set(initialBlueViruses),
      };
      return newState;
    }

    case "ADD_VIRUS_CELL": {
      const { cellCode, player } = action.payload;
      if (player === PlayerType.RED) {
        return {
          ...state,
          redVirusCellCodes: new Set([
            ...Array.from(state.redVirusCellCodes),
            cellCode,
          ]),
        };
      } else {
        return {
          ...state,
          blueVirusCellCodes: new Set([
            ...Array.from(state.blueVirusCellCodes),
            cellCode,
          ]),
        };
      }
    }

    case "ADD_CELL_TO_COLONY": {
      const { cellCode, player } = action.payload;
      return addCellToColony(cellCode, player, state);
    }

    case "SWITCH_PLAYER": {
      return {
        ...state,
        currentPlayer:
          state.currentPlayer === PlayerType.RED
            ? PlayerType.BLUE
            : PlayerType.RED,
      };
    }

    case "DECREMENT_MOVES": {
      return {
        ...state,
        movesLeft: Math.max(0, state.movesLeft - 1),
      };
    }

    case "RESET_MOVES": {
      return {
        ...state,
        movesLeft: 3,
      };
    }

    case "UPDATE_BOARD": {
      return {
        ...state,
        board: state.board.clone(),
      };
    }

    default:
      return state;
  }
}
