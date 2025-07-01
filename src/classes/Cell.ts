import { ColonySet } from "./ColonySet";
import { PlayerType } from "../interfaces/Board";

export interface ICell {
  rowIdx: number;
  colIdx: number;
  code: string;
  content: ICellContent | null;
  colonySet: ColonySet | null;
}

export interface ICellContent {
  content: CellContentType;
  player: PlayerType | null;
}

function generateCellCode(rowIdx: number, colIdx: number): string {
  return `${rowIdx}-${colIdx}`;
}

export class Cell implements ICell {
  content: ICellContent | null = null;
  code: string;

  constructor(
    public rowIdx: number,
    public colIdx: number,
    contentType: CellContentType | null,
    player: PlayerType | null,
    public colonySet: ColonySet | null
  ) {
    this.code = generateCellCode(rowIdx, colIdx);
    if (contentType) {
      this.content = {
        content: contentType,
        player: player,
      };
    }
  }
}

export enum CellContentType {
  VIRUS = "virus",
  COLONY = "colony",
}
