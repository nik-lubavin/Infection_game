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
    // Create a new Set to avoid mutating the original
    const cloned = new ColonySet(
      new Set(this.colonyCellsCodes),
      this.activated,
      this.owner
    );
    // Preserve the original ID so refreshColonySets can find and replace it
    cloned.id = this.id;
    return cloned;
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
