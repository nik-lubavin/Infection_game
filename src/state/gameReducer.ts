import { GameState, GameAction } from "./gameState";
import { Board } from "../classes/Board";
import { PlayerType } from "../interfaces/Board";
import { GRID_SIZE } from "../constants/board";
import { actionAddVirusCell } from "./actions/actionAddVirusCell";
import { actionAddCellToColony } from "./actions/actionAddCellToColony";

// Re-export types for convenience
export type { GameState, GameAction };

// Initial virus positions
const initialRedViruses = ["0-0", "1-1", "2-2", "3-3", "4-4", "5-5"];
const initialBlueViruses = ["9-9", "8-8", "7-7", "6-6", "5-6", "6-5"];



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
      return actionAddVirusCell(cellCode, player, state);
    }

    case "ADD_CELL_TO_COLONY": {
      const { cellCode, player } = action.payload;
      return actionAddCellToColony(cellCode, player, state);
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

    default:
      return state;
  }
}
