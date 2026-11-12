import type { RoomPlayerSide } from '../types/index.js';

export const DEFAULT_GRID_SIZE = 10;
export const MIN_GRID_SIZE = 2;
/** Cell codes are `row-col` with at most two digits per part. */
export const MAX_GRID_SIZE = 100;

const CELL_CODE_RE = /^(0|[1-9]\d?)-(0|[1-9]\d?)$/;

/** Strictly parses a canonical `row-col` code (no leading zeros, no signs, no spaces). */
export function parseCellCode(cellCode: string): { row: number; col: number } | null {
  if (typeof cellCode !== 'string') return null;
  const match = CELL_CODE_RE.exec(cellCode);
  if (!match) return null;
  return { row: Number(match[1]), col: Number(match[2]) };
}

export function isValidCellCode(cellCode: string, gridSize: number): boolean {
  const parsed = parseCellCode(cellCode);
  return parsed !== null && parsed.row < gridSize && parsed.col < gridSize;
}

/** All neighbours of a cell (8 directions, diagonals included) that lie on the board. */
export function getAdjacentCellCodes(cellCode: string, gridSize: number): string[] {
  const parsed = parseCellCode(cellCode);
  if (!parsed || parsed.row >= gridSize || parsed.col >= gridSize) return [];

  const result: string[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const row = parsed.row + dr;
      const col = parsed.col + dc;
      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        result.push(`${row}-${col}`);
      }
    }
  }
  return result;
}

/** Starting corner of a side: red top-left, blue bottom-right. */
export function getCornerCellCode(side: RoomPlayerSide, gridSize: number): string {
  return side === 'red' ? '0-0' : `${gridSize - 1}-${gridSize - 1}`;
}
