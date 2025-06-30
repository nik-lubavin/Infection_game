import { ColonySet } from "./ColonySet";
import { Board, IBoard } from "./Board";
import { PlayerType } from "../interfaces/Board";

export interface ICell {
  rowIdx: number;
  colIdx: number;
  content: ICellContent | null;
  board: IBoard;
  colonySet: ColonySet | null;
}

export interface ICellContent {
  content: CellContentType;
  player: PlayerType | null;
}

export class Cell implements ICell {
  content: ICellContent | null = null;
  colonySet: ColonySet | null = null;

  constructor(
    public rowIdx: number,
    public colIdx: number,
    public board: Board,
    content: CellContentType | null,
    player: PlayerType | null
  ) {
    if (content) {
      this.content = {
        content: content,
        player: player,
      };
    }
  }
}

export enum CellContentType {
  VIRUS = "virus",
  COLONY = "colony",
}
