import { GRID_SIZE } from "../../constants/board";
import { ColonySet } from "../../classes/ColonySet";

/**
 * Gets all 8 adjacent cell codes (including diagonals) without filtering
 * Returns all adjacent cells regardless of their content (virus, colony, or empty)
 */
export function getAdjacentCellCodes(cellCode: string): string[] {
  const [rowStr, colStr] = cellCode.split("-");
  const row = parseInt(rowStr);
  const col = parseInt(colStr);
  const adjacent: string[] = [];

  // Check all 8 directions (including diagonals)
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue; // Skip the cell itself

      const newRow = row + dr;
      const newCol = col + dc;

      // Check bounds
      if (
        newRow >= 0 &&
        newRow < GRID_SIZE &&
        newCol >= 0 &&
        newCol < GRID_SIZE
      ) {
        adjacent.push(`${newRow}-${newCol}`);
      }
    }
  }

  return adjacent;
}

interface AdjacentCellFilter {
  redVirusCellCodes: Set<string>;
  blueVirusCellCodes: Set<string>;
  redColonySets: ColonySet[];
  blueColonySets: ColonySet[];
}

/**
 * Gets adjacent cell codes filtered to exclude virus and colony cells
 * Returns only empty adjacent cells
 * Uses getAdjacentCellCodes internally and filters the results
 */
export function getAdjacentCellCodesFiltered(
  cellCode: string,
  filter: AdjacentCellFilter
): string[] {
  const allAdjacent = getAdjacentCellCodes(cellCode);

  return allAdjacent.filter((adjacentCellCode) => {
    // Filter out virus cells
    if (
      filter.redVirusCellCodes.has(adjacentCellCode) ||
      filter.blueVirusCellCodes.has(adjacentCellCode)
    ) {
      return false;
    }

    // Filter out colony cells
    if (
      filter.redColonySets.some((colonySet) =>
        colonySet.colonyCellsCodes.has(adjacentCellCode)
      ) ||
      filter.blueColonySets.some((colonySet) =>
        colonySet.colonyCellsCodes.has(adjacentCellCode)
      )
    ) {
      return false;
    }

    return true;
  });
}
