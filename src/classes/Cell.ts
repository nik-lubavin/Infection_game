import { ColonySet } from "./ColonySet";

export interface ICell {
  rowIdx: number;
  colIdx: number;
  content: CellContentType | null;
  colonySet: ColonySet | null;
}

export class Cell implements ICell {
  constructor(
    public rowIdx: number,
    public colIdx: number,
    public content: CellContentType | null = null,
    public colonySet: ColonySet | null = null
  ) {}
}

export enum CellContentType {
  RED_VIRUS = "red_virus",
  BLUE_VIRUS = "blue_virus",
  RED_COLONY = "red_colony",
  BLUE_COLONY = "blue_colony",
}
