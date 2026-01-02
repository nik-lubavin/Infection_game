import { PlayerType } from "../interfaces/Board";

let idCounter = 1;
export class ColonySet {
  public id: number;

  constructor(
    public colonyCellsCodes: Set<string> = new Set(),
    public activated: boolean = true,
    public owner: PlayerType
  ) {
    this.id = idCounter++;
  }

  clone() {
    return new ColonySet(this.colonyCellsCodes, this.activated, this.owner);
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
