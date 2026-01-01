import { createSlice, PayloadAction, current } from "@reduxjs/toolkit";
import { Board } from "../classes/Board";
import { GRID_SIZE } from "../constants/board";
import { PlayerType } from "../interfaces/Board";
import { actionAddVirusCell } from "../state/actions/actionAddVirusCell";
import { actionAddCellToColony } from "../state/actions/actionAddCellToColony";
import { GameState } from "../state/gameState";

// Initial virus positions
const initialRedViruses = ["0-0", "1-1", "2-2", "3-3", "4-4", "5-5"];
const initialBlueViruses = ["9-9", "8-8", "7-7", "6-6", "5-6", "6-5"];

const initialState: GameState = {
  currentPlayer: PlayerType.RED,
  movesLeft: 3,
  board: new Board(GRID_SIZE, GRID_SIZE),
  redVirusCellCodes: [],
  blueVirusCellCodes: [],
  redColonySets: [],
  blueColonySets: [],
  availableCellCodes: [],
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    initializeGame: (state) => {
      state.board = new Board(GRID_SIZE, GRID_SIZE);
      state.redVirusCellCodes = [...initialRedViruses];
      state.blueVirusCellCodes = [...initialBlueViruses];
    },
    addVirusCell: (state, action: PayloadAction<{ cellCode: string; player: PlayerType }>) => {
      const plainState = current(state) as GameState;
      const newState = actionAddVirusCell(action.payload.cellCode, action.payload.player, plainState);
      return newState;
    },
    addCellToColony: (state, action: PayloadAction<{ cellCode: string; player: PlayerType }>) => {
      const plainState = current(state) as GameState;
      const newState = actionAddCellToColony(action.payload.cellCode, action.payload.player, plainState);
      return newState;
    },
    switchPlayer: (state) => {
      state.currentPlayer =
        state.currentPlayer === PlayerType.RED ? PlayerType.BLUE : PlayerType.RED;
    },
    decrementMoves: (state) => {
      state.movesLeft = Math.max(0, state.movesLeft - 1);
    },
    resetMoves: (state) => {
      state.movesLeft = 3;
    },
  },
});

export const {
  initializeGame,
  addVirusCell,
  addCellToColony,
  switchPlayer,
  decrementMoves,
  resetMoves,
} = gameSlice.actions;

export default gameSlice.reducer;

