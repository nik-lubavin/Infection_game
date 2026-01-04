import { createSlice, PayloadAction, current } from "@reduxjs/toolkit";
import { Board } from "../classes/Board";
import { GRID_SIZE } from "../constants/board";
import { PlayerType } from "../interfaces/Board";
import { actionAddVirusCell } from "../state/actions/actionAddVirusCell";
import { actionAddCellToColony } from "../state/actions/actionAddCellToColony";
import { GameState } from "../state/gameState";
import { calculateAvailableCellCodes } from "../state/helpers/cellsGetters";
import { testInitialViruses } from "../state/helpers/testInitialViruses";

const initialState: GameState = {
  gamePhase: "not_started",
  movesLeft: 3,
  board: new Board(GRID_SIZE, GRID_SIZE),
  redVirusCellCodes: [],
  blueVirusCellCodes: [],
  redColonySets: [],
  blueColonySets: [],
  availableCellCodes: [],
  loser: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    initializeNewGame: (state) => {
      state.board = new Board(GRID_SIZE, GRID_SIZE);
      state.redVirusCellCodes = [];
      state.blueVirusCellCodes = [];
      state.gamePhase = PlayerType.RED;
      state.availableCellCodes = calculateAvailableCellCodes(state);
      state.loser = null;
    },
    initializeTestGame: (state) => {
      state.board = new Board(GRID_SIZE, GRID_SIZE);
      state.redVirusCellCodes = [...testInitialViruses.red];
      state.blueVirusCellCodes = [...testInitialViruses.blue];
      state.availableCellCodes = calculateAvailableCellCodes(state);
      state.loser = null;
    },
    addVirusCell: (state, action: PayloadAction<{ cellCode: string }>) => {
      const plainState = current(state) as GameState;
      return actionAddVirusCell(action.payload.cellCode, plainState);
    },
    addCellToColony: (state, action: PayloadAction<{ cellCode: string }>) => {
      const plainState = current(state) as GameState;
      const newState = actionAddCellToColony(
        action.payload.cellCode,
        plainState
      );
      return newState;
    },
    switchPlayer: (state) => {
      state.gamePhase =
        state.gamePhase === PlayerType.RED ? PlayerType.BLUE : PlayerType.RED;
      state.availableCellCodes = calculateAvailableCellCodes(state);
      if (!state.availableCellCodes.length) {
        state.loser = state.gamePhase;
      }
    },
    decrementMoves: (state) => {
      state.movesLeft = Math.max(0, state.movesLeft - 1);
    },
    resetMoves: (state) => {
      state.movesLeft = 3;
    },
    clearLoser: (state) => {
      state.loser = null;
    },
  },
});

export const {
  initializeNewGame,
  addVirusCell,
  addCellToColony,
  switchPlayer,
  decrementMoves,
  resetMoves,
  clearLoser,
} = gameSlice.actions;

export default gameSlice.reducer;
