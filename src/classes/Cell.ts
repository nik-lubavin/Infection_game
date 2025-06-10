export interface ICell {
  rowIdx: number;
  colIdx: number;
  content: CellContentType | null;
}

export class Cell implements ICell {
  constructor(
    public rowIdx: number,
    public colIdx: number,
    public content: CellContentType | null = null
  ) {}
}

export enum CellContentType {
  RED_VIRUS = "red_virus",
  BLUE_VIRUS = "blue_virus",
  RED_COLONY = "red_colony",
  BLUE_COLONY = "blue_colony",
  // EMPTY = "empty",
}
