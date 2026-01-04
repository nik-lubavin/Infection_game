import { Board } from "../classes/Board";
import { ColonySet } from "../classes/ColonySet";
import { GRID_SIZE } from "../constants/board";
import { PlayerType } from "../interfaces/Board";

export type GamePhase =
  | PlayerType.RED
  | PlayerType.BLUE
  | "game_over"
  | "not_started";

export interface GameState {
  gamePhase: GamePhase;
  movesLeft: number;
  board: Board;
  redVirusCellCodes: string[];
  blueVirusCellCodes: string[];
  redColonySets: ColonySet[];
  blueColonySets: ColonySet[];
  availableCellCodes: string[];
  loser: PlayerType | null;
}

export type GameAction =
  | { type: "INITIALIZE_GAME" }
  | {
      type: "ADD_VIRUS_CELL";
      payload: { cellCode: string; player: PlayerType };
    }
  | {
      type: "ADD_CELL_TO_COLONY";
      payload: { cellCode: string; player: PlayerType };
    }
  | { type: "SWITCH_PLAYER" }
  | { type: "DECREMENT_MOVES" }
  | { type: "RESET_MOVES" };

export const initialGameState: GameState = {
  gamePhase: PlayerType.RED,
  movesLeft: 3,
  board: new Board(GRID_SIZE, GRID_SIZE),
  redVirusCellCodes: [],
  blueVirusCellCodes: [],
  redColonySets: [],
  blueColonySets: [],
  availableCellCodes: [],
  loser: null,
};
