import { PlayerType } from "../interfaces/Board";
import { CellContentType, ICell } from "./Cell";

let idCounter = 1;
export class ColonySet {
  public id: number;
  public _previousIds: number[] = [];

  constructor(
    public colonyCellsCodes: Set<string> = new Set(),
    public playerType: PlayerType,
    public activated: boolean = true,
    previousId?: number
  ) {
    this.id = idCounter++;
    if (previousId) {
      this._previousIds.push(previousId);
    }
  }

  clone() {
    return new ColonySet(
      this.colonyCellsCodes,
      this.playerType,
      this.activated,
      this.id
    );
  }

  addCellCodes(cellCodes: string[]) {
    cellCodes.forEach((cellCode) => {
      this.colonyCellsCodes.add(cellCode);
    });
  }

  getCellCodes(): string[] {
    return Array.from(this.colonyCellsCodes);
  }

  getColonyCells(): ICell[] {
    // For now, return basic cell info based on cell codes
    // This will be enhanced when we have proper board integration
    return Array.from(this.colonyCellsCodes).map((code) => {
      const [rowStr, colStr] = code.split("-");
      return {
        rowIdx: parseInt(rowStr),
        colIdx: parseInt(colStr),
        code: code,
        content: {
          content: CellContentType.COLONY,
          player: this.playerType,
        },
      } as ICell;
    });
  }
}
