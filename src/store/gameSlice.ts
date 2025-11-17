import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Board } from "../classes/Board";
import { ColonySet } from "../classes/ColonySet";
import { GRID_SIZE } from "../constants/board";
import { PlayerType } from "../interfaces/Board";
import { actionAddVirusCell } from "../state/actions/actionAddVirusCell";
import { actionAddCellToColony } from "../state/actions/actionAddCellToColony";

// Initial virus positions
const initialRedViruses = ["0-0", "1-1", "2-2", "3-3", "4-4", "5-5"];
const initialBlueViruses = ["9-9", "8-8", "7-7", "6-6", "5-6", "6-5"];

export interface GameState {
  currentPlayer: PlayerType;
  movesLeft: number;
  board: Board;
  redVirusCellCodes: Set<string>;
  blueVirusCellCodes: Set<string>;
  redColonySets: ColonySet[];
  blueColonySets: ColonySet[];
  availableCellCodes: string[];
}

// Redux doesn't support Set/Map in state, so we'll use arrays and convert
// For now, we'll keep Sets but serialize them properly
const initialState: GameState = {
  currentPlayer: PlayerType.RED,
  movesLeft: 3,
  board: new Board(GRID_SIZE, GRID_SIZE),
  redVirusCellCodes: new Set<string>(),
  blueVirusCellCodes: new Set<string>(),
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
      state.redVirusCellCodes = new Set(initialRedViruses);
      state.blueVirusCellCodes = new Set(initialBlueViruses);
    },
    addVirusCell: (state, action: PayloadAction<{ cellCode: string; player: PlayerType }>) => {
      const newState = actionAddVirusCell(action.payload.cellCode, action.payload.player, state);
      return newState;
    },
    addCellToColony: (state, action: PayloadAction<{ cellCode: string; player: PlayerType }>) => {
      const newState = actionAddCellToColony(action.payload.cellCode, action.payload.player, state);
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

