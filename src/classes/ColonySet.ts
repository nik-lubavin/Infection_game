// import { CellContentType, ICell } from "./Cell";

let idCounter = 1;
export class ColonySet {
  public id: number;

  constructor(
    public colonyCellsCodes: Set<string> = new Set(),
    public activated: boolean = true
  ) {
    this.id = idCounter++;
  }

  clone() {
    return new ColonySet(this.colonyCellsCodes, this.activated);
  }

  addCellCodes(cellCodes: string[]) {
    cellCodes.forEach((cellCode) => {
      this.colonyCellsCodes.add(cellCode);
    });
  }

  getCellCodes(): string[] {
    return Array.from(this.colonyCellsCodes);
  }
}
