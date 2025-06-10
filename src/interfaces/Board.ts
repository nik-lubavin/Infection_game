import { Board } from "../classes/Board";
import { ICell } from "../classes/Cell";

export enum PlayerType {
  RED = "red",
  BLUE = "blue",
}

export interface GameState {
  currentPlayer: PlayerType;
  movesLeft: number;
  board: Board;
  availableCells: ICell[];
}
