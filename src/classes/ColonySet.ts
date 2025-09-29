import { PlayerType } from "../interfaces/Board";
import { Board } from "./Board";
import { CellContentType, ICell } from "./Cell";

let idCounter = 1;
export class ColonySet {
  public id: number;

  constructor(
    public colonyCellsCodes: Set<string> = new Set(),
    public playerType: PlayerType,
    public activated: boolean = true
  ) {
    this.id = idCounter++;
  }

  clone() {
    return new ColonySet(
      this.colonyCellsCodes,
      this.playerType,
      this.activated
    );
    // const newSet = new ColonySet(
    //   this.colonyCellsCodes,
    //   this.playerType,
    //   this.activated,
    // );

    // return newSet;
  }

  addCellCodes(cellCodes: string[]) {
    cellCodes.forEach((cellCode) => {
      this.colonyCellsCodes.add(cellCode);
    });
  }

  getCellCodes(): string[] {
    return Array.from(this.colonyCellsCodes);
  }

  // getColonyCells(): ICell[] {
  //   return this.colonyCellsCodes.map((code) => this.board.getCellByCode(code));
  // }

  // public checkActivity(board: Board) {
  //   for (const colonyCellCode of this.colonyCellsCodes) {
  //     const adjacentVirusCells = board
  //       .getAdjacentCells(colonyCellCode)
  //       .filter(
  //         (cell) =>
  //           cell.content?.content === CellContentType.VIRUS &&
  //           cell.content?.player === this.playerType
  //       );
  //     if (adjacentVirusCells.length) {
  //       return true;
  //     }
  //   }
  //   console.log("checkActivity - false", this.playerType, this.id);
  //   return false;
  // }
}
