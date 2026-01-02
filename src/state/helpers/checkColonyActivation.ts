import { GRID_SIZE } from "../../constants/board";
import { ColonySet } from "../../classes/ColonySet";

export function checkColonyIsActive(
  colonySet: ColonySet,
  playerVirusCellCodes: string[]
): boolean {
  const virusSet = new Set(playerVirusCellCodes);

  for (const cellCode of Array.from(colonySet.colonyCellsCodes)) {
    const [rowStr, colStr] = cellCode.split("-");
    const row = parseInt(rowStr);
    const col = parseInt(colStr);

    // Check all 8 directions
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
          const adjacentCellCode = `${newRow}-${newCol}`;
          if (virusSet.has(adjacentCellCode)) {
            return true; // Found an adjacent virus cell
          }
        }
      }
    }
  }

  return false; // No adjacent virus cells found
}
