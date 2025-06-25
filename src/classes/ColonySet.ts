import { PlayerType } from "../interfaces/Board";
import { CellContentType, ICell } from "./Cell";

export class ColonySet {
  public activated: boolean = false;

  constructor(
    private colonyCells: ICell[] = [],
    public playerType: PlayerType
  ) {}

  addCell(cell: ICell) {
    this.colonyCells.push(cell);
  }

  private checkActivity() {
    const friendlyVirus =
      this.playerType === PlayerType.RED
        ? CellContentType.RED_VIRUS
        : CellContentType.BLUE_VIRUS;

    for (const colonyCell of this.colonyCells) {
      const adjacentVirusCells = colonyCell.board
        .getAdjacentCells(colonyCell)
        .filter((cell) => cell.content === friendlyVirus);

      if (adjacentVirusCells.length) {
        return true;
      }
    }

    return false;
  }

  public checkAndUpdateActivity() {
    const activity = this.checkActivity();
    if (activity !== this.activated) {
      console.log(
        `ColonySet activity changed: ${this.activated} -> ${activity}`
      );
      this.activated = activity;
    }
  }
}
