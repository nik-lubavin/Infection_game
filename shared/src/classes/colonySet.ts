import { type IColonySet, PlayerType } from '../types/index.js';

let colonyIdCounter = 1;
export class ColonySet implements IColonySet {
  public id: number;

  constructor(
    public colonyCellsCodes: Set<string> = new Set(),
    public activated: boolean = true,
    public owner: PlayerType,
    id?: number
  ) {
    this.id = id ?? colonyIdCounter++;
  }

  static fromIColonySet(colony: IColonySet): ColonySet {
    const codes =
      colony.colonyCellsCodes instanceof Set
        ? colony.colonyCellsCodes
        : new Set(colony.colonyCellsCodes as unknown as Iterable<string>);
    return new ColonySet(codes, colony.activated, colony.owner, colony.id);
  }

  toIColonySet(): IColonySet {
    return {
      id: this.id,
      colonyCellsCodes: this.colonyCellsCodes,
      activated: this.activated,
      owner: this.owner,
    };
  }

  clone() {
    const cloned = new ColonySet(new Set(this.colonyCellsCodes), this.activated, this.owner);
    cloned.id = this.id;
    return cloned;
  }

  addCellCodes(cellCodes: string[]) {
    cellCodes.forEach((cellCode) => this.colonyCellsCodes.add(cellCode));
  }

  getCellCodes(): string[] {
    return Array.from(this.colonyCellsCodes);
  }
}
