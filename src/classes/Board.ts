import { PlayerType } from "../interfaces/Board";
import { Cell, CellContentType, ICell } from "./Cell";
import { ColonySet } from "./ColonySet";

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
  cells: ICell[][];
  version: number;
  clone(): IBoard;
  getAdjacentCells(cellCode: string): ICell[];
  getAdjacentColonyCells(cell: ICell, playerType: PlayerType): ICell[];
  // getJoinedColonies(playerType: PlayerType): { id: number; cells: ICell[] }[];
  getColonyCells(playerType: PlayerType): ICell[];
  getVirusCells(playerType: PlayerType): ICell[];
  getStartingCell(playerType: PlayerType): ICell;
}

let versionCounter = 0;
export class Board implements IBoard {
  version: number;
  cells: ICell[][];

  constructor(public rows: number, public cols: number) {
    this.version = versionCounter++;
    this.cells = generateNewEmptyBoard(rows, cols);
  }

  public cloneCell(cell: ICell): ICell {
    const newCell = new Cell(
      cell.rowIdx,
      cell.colIdx,
      // this,
      cell.content?.content ?? null,
      cell.content?.player ?? null,
      cell.colonySet ?? null
    );

    this.cells[cell.rowIdx][cell.colIdx] = newCell;

    return newCell;
  }

  // Create a deep copy of the current board
  public clone(): Board {
    const newBoard = new Board(this.rows, this.cols);
    newBoard.cells = generateNewEmptyBoard(this.rows, this.cols);

    // Deep clone the cells array
    for (let rowIdx = 0; rowIdx < this.rows; rowIdx++) {
      for (let colIdx = 0; colIdx < this.cols; colIdx++) {
        const originalCell = this.cells[rowIdx][colIdx];
        newBoard.cloneCell(originalCell);
      }
    }
    newBoard.version = versionCounter++;
    return newBoard;
  }

  getAllCells(): ICell[] {
    return this.cells.flat();
  }

  getAllCellsByColonySet(colonySet: ColonySet): ICell[] {
    return this.cells.flat().filter((cell) => cell.colonySet === colonySet);
  }

  getCellByCode(code: string): ICell {
    const cell = this.cells.flat().find((cell) => cell.code === code);
    if (!cell) {
      throw new Error(`Cell with code ${code} not found`);
    }
    return cell;
  }

  getAdjacentCells(cellCode: string): ICell[] {
    const cell = this.getCellByCode(cellCode);
    const adjacentCells: ICell[] = [];

    if (cell.rowIdx > 0) {
      adjacentCells.push(this.cells[cell.rowIdx - 1][cell.colIdx]);
      if (cell.colIdx > 0) {
        adjacentCells.push(this.cells[cell.rowIdx - 1][cell.colIdx - 1]);
      }
      if (cell.colIdx < this.cols - 1) {
        adjacentCells.push(this.cells[cell.rowIdx - 1][cell.colIdx + 1]);
      }
    }

    if (cell.rowIdx < this.rows - 1) {
      adjacentCells.push(this.cells[cell.rowIdx + 1][cell.colIdx]);
      if (cell.colIdx > 0) {
        adjacentCells.push(this.cells[cell.rowIdx + 1][cell.colIdx - 1]);
      }
      if (cell.colIdx < this.cols - 1) {
        adjacentCells.push(this.cells[cell.rowIdx + 1][cell.colIdx + 1]);
      }
    }

    if (cell.colIdx > 0) {
      adjacentCells.push(this.cells[cell.rowIdx][cell.colIdx - 1]);
      if (cell.rowIdx > 0) {
        adjacentCells.push(this.cells[cell.rowIdx - 1][cell.colIdx - 1]);
      }
      if (cell.rowIdx < this.rows - 1) {
        adjacentCells.push(this.cells[cell.rowIdx + 1][cell.colIdx - 1]);
      }
    }

    if (cell.colIdx < this.cols - 1) {
      adjacentCells.push(this.cells[cell.rowIdx][cell.colIdx + 1]);
      if (cell.rowIdx > 0) {
        adjacentCells.push(this.cells[cell.rowIdx - 1][cell.colIdx + 1]);
      }
      if (cell.rowIdx < this.rows - 1) {
        adjacentCells.push(this.cells[cell.rowIdx + 1][cell.colIdx + 1]);
      }
    }

    return Array.from(new Set(adjacentCells));
  }

  getAdjacentColonyCells(cell: ICell, playerType: PlayerType): ICell[] {
    const adjacentCells = this.getAdjacentCells(cell.code);
    const result = adjacentCells.filter(
      (cell) =>
        cell.content?.content === CellContentType.COLONY &&
        cell.content?.player === playerType
    );
    return result;
  }

  public getVirusCells(playerType: PlayerType): ICell[] {
    const virusCells: ICell[] = [];
    for (const row of this.cells) {
      for (const cell of row) {
        if (
          cell.content?.content === CellContentType.VIRUS &&
          cell.content?.player === playerType
        ) {
          virusCells.push(cell);
        }
      }
    }

    return virusCells;
  }

  public getStartingCell(playerType: PlayerType): ICell {
    if (playerType === PlayerType.RED) {
      return this.cells[0][0];
    } else {
      return this.cells[this.rows - 1][this.cols - 1];
    }
  }

  public getColonyCells(
    playerType: PlayerType,
    activatedOnly: boolean | null = null
  ): ICell[] {
    const colonyCells: ICell[] = [];
    for (const row of this.cells) {
      for (const cell of row) {
        if (
          cell.content?.content === CellContentType.COLONY &&
          cell.content?.player === playerType &&
          (activatedOnly === null ||
            cell.colonySet?.activated === activatedOnly)
        ) {
          colonyCells.push(cell);
        }
      }
    }

    return colonyCells;
  }
}
