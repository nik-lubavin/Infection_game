import { PlayerType } from "../interfaces/Board";
import { ICell } from "./Cell";

let idCounter = 0;
export class ColonySet {
  public activated: boolean;
  public id: number;

  constructor(
    private colonyCells: ICell[] = [],
    public playerType: PlayerType
  ) {
    this.id = idCounter++;
    this.activated = true;
  }

  addCell(cell: ICell) {
    this.colonyCells.push(cell);
  }

  getColonyCells(): ICell[] {
    return this.colonyCells;
  }

  private checkActivity() {
    // for (const colonyCell of this.colonyCells) {
    //   const adjacentVirusCells = colonyCell.board
    //     .getAdjacentCells(colonyCell)
    //     .filter(
    //       (cell) =>
    //         cell.content?.content === CellContentType.VIRUS &&
    //         cell.content?.player === this.playerType
    //     );
    //   if (adjacentVirusCells.length) {
    //     return true;
    //   }
    // }
    // return false;
  }

  public checkAndUpdateActivity() {
    // const activity = this.checkActivity();
    // if (activity !== this.activated) {
    //   console.log(
    //     `ColonySet activity changed: ${this.activated} -> ${activity}`
    //   );
    //   this.activated = activity;
    // }
  }
}
