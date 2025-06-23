import { ICell } from "./Cell";

export class ColonySet {
  public activated: boolean = false;
  constructor(private cells: ICell[] = []) {}

  addCell(cell: ICell) {
    this.cells.push(cell);
  }
}
