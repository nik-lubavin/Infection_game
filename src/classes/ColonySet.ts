import { PlayerType } from "../interfaces/Board";
import { Board } from "./Board";
import { CellContentType, ICell } from "./Cell";

let idCounter = 1;
export class ColonySet {
  public id: number;

  constructor(
    private colonyCellsCodes: string[] = [],
    public playerType: PlayerType,
    public activated: boolean = true,
    private board: Board
  ) {
    this.id = idCounter++;
  }

  clone() {
    return new ColonySet(
      this.colonyCellsCodes,
      this.playerType,
      this.activated,
      this.board
    );
  }

  addCell(cell: ICell) {
    this.colonyCellsCodes.push(cell.code);
  }

  getColonyCells(): ICell[] {
    return this.colonyCellsCodes.map((code) => this.board.getCellByCode(code));
  }

  public checkActivity(board: Board) {
    for (const colonyCellCode of this.colonyCellsCodes) {
      const adjacentVirusCells = board
        .getAdjacentCells(colonyCellCode)
        .filter(
          (cell) =>
            cell.content?.content === CellContentType.VIRUS &&
            cell.content?.player === this.playerType
        );
      if (adjacentVirusCells.length) {
        return true;
      }
    }
    console.log("checkActivity - false", this.playerType, this.id);
    return false;
  }
}
