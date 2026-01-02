import { Cell, ICell } from "./Cell";

function generateNewEmptyBoard(rowsNum: number, colsNum: number): ICell[][] {
  const cells: ICell[][] = [];
  for (let row = 0; row < rowsNum; row++) {
    cells[row] = [];
    for (let col = 0; col < colsNum; col++) {
      cells[row][col] = new Cell(row, col, null, null, null);
    }
  }
  return cells;
}

export interface IBoard {
  rows: number;
  cols: number;
  // cells: ICell[][];
  version: number;
  clone(): IBoard;
}

let versionCounter = 0;
export class Board implements IBoard {
  version: number;
  cells: ICell[][];

  constructor(public rows: number, public cols: number) {
    this.version = versionCounter++;
    this.cells = generateNewEmptyBoard(rows, cols);
  }

  // Create a deep copy of the current board
  public clone(): Board {
    const newBoard = new Board(this.rows, this.cols);
    newBoard.cells = generateNewEmptyBoard(this.rows, this.cols);
    newBoard.version = versionCounter++;
    return newBoard;
  }
}
