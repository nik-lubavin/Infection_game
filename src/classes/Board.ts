import { PlayerType } from "../interfaces/Board";
import { Cell, CellContentType, ICell } from "./Cell";

export interface IBoard {
  rows: number;
  cols: number;
  cells: ICell[][];
  getAdjacentCells(cell: ICell): ICell[];
  getAdjacentColonyCell(cell: ICell, playerType: PlayerType): ICell[];
  getJoinedColonies(playerType: PlayerType): { id: number; cells: ICell[] }[];
  getColonyCells(playerType: PlayerType): ICell[];
  getVirusCells(playerType: PlayerType): ICell[];
  getStartingCell(playerType: PlayerType): ICell;
}

export class Board implements IBoard {
  private constructor(
    public rows: number,
    public cols: number,
    public cells: ICell[][] = []
  ) {}

  // Create a deep copy of the current board
  public clone(): Board {
    const newBoard = new Board(this.rows, this.cols);
    // Deep clone the cells array
    // const clonedCells: ICell[][] = [];
    for (let rowIdx = 0; rowIdx < this.rows; rowIdx++) {
      const clonedRow: ICell[] = [];
      for (let colIdx = 0; colIdx < this.cols; colIdx++) {
        const originalCell = this.cells[rowIdx][colIdx];
        clonedRow.push(new Cell(rowIdx, colIdx, originalCell.content, this));
      }
      newBoard.cells.push(clonedRow);
    }

    return newBoard;
  }

  static createBoard(rowNumber: number, columnNumber: number): Board {
    const newBoard = new Board(rowNumber, columnNumber, []);
    // newBoard.cells: ICell[][] = [];
    for (let rowIdx = 0; rowIdx < rowNumber; rowIdx++) {
      const row: ICell[] = [];
      for (let colIdx = 0; colIdx < columnNumber; colIdx++) {
        row.push(new Cell(rowIdx, colIdx, null, newBoard));
      }
      newBoard.cells.push(row);
    }
    return newBoard;
  }

  getAllCells(): ICell[] {
    return this.cells.flat();
  }

  getAdjacentCells(cell: ICell): ICell[] {
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

  getAdjacentColonyCell(cell: ICell, playerType: PlayerType): ICell[] {
    const colony =
      playerType === PlayerType.RED
        ? CellContentType.RED_COLONY
        : CellContentType.BLUE_COLONY;
    const adjacentCells = this.getAdjacentCells(cell);
    return adjacentCells.filter((cell) => cell.content === colony);
  }

  getJoinedColonies(playerType: PlayerType) {
    const cells = this.getColonyCells(playerType);
    cells.sort((a, b) => {
      const rowDiff = a.rowIdx - b.rowIdx;
      const colDiff = a.colIdx - b.colIdx;
      return rowDiff + colDiff;
    });

    console.log("AFTER SORT COLONIES", cells);
    const colonies: { id: number; cells: ICell[] }[] = [];
    let id = 0;
    let currentColony;
    let lastCell: ICell | null = null;
    for (const cell of cells) {
      if (!currentColony) {
        currentColony = { id, cells: [cell] };
        colonies.push(currentColony);
        id++;
        lastCell = cell;
        continue;
      }

      if (
        cell.rowIdx - lastCell!.rowIdx <= 1 ||
        cell.colIdx - lastCell!.colIdx <= 1
      ) {
        currentColony.cells.push(cell);
      } else {
        currentColony = { id, cells: [cell] };
        colonies.push(currentColony);
        id++;
      }
      lastCell = cell;
    }
    console.log("COLONIES", colonies);
    return colonies;
  }

  updateCell(cell: ICell) {
    const newCell = new Cell(cell.rowIdx, cell.colIdx, cell.content, this);
    this.cells[cell.rowIdx][cell.colIdx] = newCell;
  }

  public getVirusCells(playerType: PlayerType): ICell[] {
    const virus =
      playerType === PlayerType.RED
        ? CellContentType.RED_VIRUS
        : CellContentType.BLUE_VIRUS;
    const virusCells: ICell[] = [];
    for (const row of this.cells) {
      for (const cell of row) {
        if (cell.content === virus) {
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

  public getColonyCells(playerType: PlayerType): ICell[] {
    const colony =
      playerType === PlayerType.RED
        ? CellContentType.RED_COLONY
        : CellContentType.BLUE_COLONY;
    const colonyCells: ICell[] = [];
    for (const row of this.cells) {
      for (const cell of row) {
        if (cell.content === colony) {
          colonyCells.push(cell);
        }
      }
    }

    return colonyCells;
  }

  // public markAllUnavailableCells(): void {
  //   for (const row of this.cells) {
  //     for (const cell of row) {
  //       cell.availableToMove = false;
  //     }
  //   }
  // }
}
