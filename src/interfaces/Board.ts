import { Board } from "../classes/Board";
import { ICell } from "../classes/Cell";
import { GamePhase } from "@infection-game/shared";

export enum PlayerType {
  RED = "red",
  BLUE = "blue",
}

export interface GameState {
  gamePhase: GamePhase;
  movesLeft: number;
  board: Board;
  availableCells: ICell[];
}
