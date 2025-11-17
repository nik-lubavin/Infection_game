import React, {
  createContext,
  useContext,
  ReactNode,
  useReducer,
  useEffect,
} from "react";
import { PlayerType } from "../interfaces/Board";
import { ColonySet } from "../classes/ColonySet";
import { gameReducer, GameState, GameAction } from "../state/gameReducer";
import { initialGameState } from "../state/gameState";

interface GameContextType {
  // State from reducer
  state: GameState;
  dispatch: React.Dispatch<GameAction>;

  // Convenience getters
  currentPlayer: PlayerType;
  movesLeft: number;
  board: any;

  // Virus cells
  redVirusCellCodes: Set<string>;
  blueVirusCellCodes: Set<string>;

  // Colony sets
  redColonySets: ColonySet[];
  blueColonySets: ColonySet[];

  // Actions
  addVirusCellCode: (cellCode: string, player: PlayerType) => void;
  addCellToColony: (cellCode: string, player: PlayerType) => void;
  switchPlayer: () => void;
  decrementMoves: () => void;
  resetMoves: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Initialize game on mount
  useEffect(() => {
    dispatch({ type: "INITIALIZE_GAME" });
  }, []);

  // Convenience getters
  const currentPlayer = state.currentPlayer;
  const movesLeft = state.movesLeft;
  const board = state.board;
  const redVirusCellCodes = state.redVirusCellCodes;
  const blueVirusCellCodes = state.blueVirusCellCodes;
  const redColonySets = state.redColonySets;
  const blueColonySets = state.blueColonySets;

  // Action creators
  const addVirusCellCode = (cellCode: string, player: PlayerType) => {
    dispatch({ type: "ADD_VIRUS_CELL", payload: { cellCode, player } });
  };

  const addCellToColony = (cellCode: string, player: PlayerType) => {
    dispatch({ type: "ADD_CELL_TO_COLONY", payload: { cellCode, player } });
  };

  const switchPlayer = () => {
    dispatch({ type: "SWITCH_PLAYER" });
  };

  const decrementMoves = () => {
    dispatch({ type: "DECREMENT_MOVES" });
  };

  const resetMoves = () => {
    dispatch({ type: "RESET_MOVES" });
  };

  const value = {
    state,
    dispatch,
    currentPlayer,
    switchPlayer,
    movesLeft,
    board,
    redVirusCellCodes,
    blueVirusCellCodes,
    redColonySets,
    blueColonySets,
    addVirusCellCode,
    addCellToColony,
    decrementMoves,
    resetMoves,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
