import { ColonySet } from "./ColonySet";
import { Board, IBoard } from "./Board";

export interface ICell {
  rowIdx: number;
  colIdx: number;
  content: CellContentType | null;
  board: IBoard;
  colonySet: ColonySet | null;
}

export class Cell implements ICell {
  colonySet: ColonySet | null = null;
  constructor(
    public rowIdx: number,
    public colIdx: number,
    public content: CellContentType | null = null,
    public board: Board
  ) {}

  // getAdjacentCells(board: IBoard): ICell[] {
  //   // return board.getAdjacentCells(this);
  // }
}

export enum CellContentType {
  RED_VIRUS = "red_virus",
  BLUE_VIRUS = "blue_virus",
  RED_COLONY = "red_colony",
  BLUE_COLONY = "blue_colony",
}
