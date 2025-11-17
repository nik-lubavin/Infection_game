import { GRID_SIZE } from "../../constants/board";
import { ColonySet } from "../../classes/ColonySet";

interface AdjacentCellFilter {
  redVirusCellCodes: Set<string>;
  blueVirusCellCodes: Set<string>;
  redColonySets: ColonySet[];
  blueColonySets: ColonySet[];
}

export function helperGetAdjacentCellCodes(
  cellCode: string,
  filter: AdjacentCellFilter
): string[] {
  const [rowStr, colStr] = cellCode.split("-");
  const row = parseInt(rowStr);
  const col = parseInt(colStr);

  const adjacent: string[] = [];

  // Check all 8 directions
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue; // Skip the cell itself

      const newRow = row + dr;
      const newCol = col + dc;

      // Check bounds
      if (
        newRow < 0 ||
        newRow >= GRID_SIZE ||
        newCol < 0 ||
        newCol >= GRID_SIZE
      ) {
        continue;
      }

      const adjacentCellCode = `${newRow}-${newCol}`;

      // Check if the cell is a RED or BLUE virus cell
      if (
        filter.redVirusCellCodes.has(adjacentCellCode) ||
        filter.blueVirusCellCodes.has(adjacentCellCode)
      ) {
        continue;
      }

      // Check if the cell is a RED or BLUE colony cell
      if (
        filter.redColonySets.some((colonySet) =>
          colonySet.colonyCellsCodes.has(adjacentCellCode)
        ) ||
        filter.blueColonySets.some((colonySet) =>
          colonySet.colonyCellsCodes.has(adjacentCellCode)
        )
      ) {
        continue;
      }

      adjacent.push(adjacentCellCode);
    }
  }

  return adjacent;
}
