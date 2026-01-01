import { GRID_SIZE } from "../../constants/board";
import { ColonySet } from "../../classes/ColonySet";

/**
 * Checks if a colony has any adjacent virus cells of the same player
 * A colony is active if at least one of its cells has an adjacent virus cell
 */
export function checkColonyHasAdjacentVirus(
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

/**
 * Updates the activation status of all colonies based on whether they have adjacent virus cells
 */
export function updateColonyActivations(
  redColonySets: ColonySet[],
  blueColonySets: ColonySet[],
  redVirusCellCodes: string[],
  blueVirusCellCodes: string[]
): { redColonySets: ColonySet[]; blueColonySets: ColonySet[] } {
  // Update red colonies
  const updatedRedColonies = redColonySets.map((colony) => {
    const hasAdjacentVirus = checkColonyHasAdjacentVirus(colony, redVirusCellCodes);
    if (colony.activated !== hasAdjacentVirus) {
      return new ColonySet(
        new Set(colony.colonyCellsCodes),
        colony.playerType,
        hasAdjacentVirus
      );
    }
    return colony;
  });

  // Update blue colonies
  const updatedBlueColonies = blueColonySets.map((colony) => {
    const hasAdjacentVirus = checkColonyHasAdjacentVirus(colony, blueVirusCellCodes);
    if (colony.activated !== hasAdjacentVirus) {
      return new ColonySet(
        new Set(colony.colonyCellsCodes),
        colony.playerType,
        hasAdjacentVirus
      );
    }
    return colony;
  });

  return {
    redColonySets: updatedRedColonies,
    blueColonySets: updatedBlueColonies,
  };
}

