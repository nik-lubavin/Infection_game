import { useGameContext } from "../contexts/GameContext";
import { PlayerType } from "../interfaces/Board";
import { CellType } from "../enums/CellType";
import { GRID_SIZE } from "../constants/board";

// Hook that calculates available cells for a player
export function useAvailableCells(currentPlayer: PlayerType) {
  const {
    redVirusCellCodes,
    blueVirusCellCodes,
    redColonySets,
    blueColonySets,
  } = useGameContext();

  // Helper function to get adjacent cell codes
  const getAdjacentCellCodes = (cellCode: string): string[] => {
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
  };

  // Helper function to get cell type
  const getCellType = (cellCode: string): CellType | null => {
    if (redVirusCellCodes.has(cellCode)) {
      return CellType.RED_VIRUS;
    } else if (blueVirusCellCodes.has(cellCode)) {
      return CellType.BLUE_VIRUS;
    } else {
      const redColonySet = redColonySets.find((set) =>
        set.colonyCellsCodes.has(cellCode)
      );
      if (redColonySet) {
        return redColonySet.activated
          ? CellType.RED_COLONY_ACTIVE
          : CellType.RED_COLONY_INACTIVE;
      }

      const blueColonySet = blueColonySets.find((set) =>
        set.colonyCellsCodes.has(cellCode)
      );
      if (blueColonySet) {
        return blueColonySet.activated
          ? CellType.BLUE_COLONY_ACTIVE
          : CellType.BLUE_COLONY_INACTIVE;
      }

      return null;
    }
  };

  // Calculate available cells
  const calculateAvailableCells = (): string[] => {
    const virusContainer =
      currentPlayer === PlayerType.RED ? redVirusCellCodes : blueVirusCellCodes;
    const enemyVirusType =
      currentPlayer === PlayerType.RED
        ? CellType.BLUE_VIRUS
        : CellType.RED_VIRUS;
    const colonyContainer =
      currentPlayer === PlayerType.RED ? redColonySets : blueColonySets;

    const result: Set<string> = new Set();

    // Check virus cells
    virusContainer.forEach((virusCellCode) => {
      const adjacentVirusCellCodes = getAdjacentCellCodes(virusCellCode);
      adjacentVirusCellCodes.forEach((cellCode) => {
        const cellType = getCellType(cellCode);
        if (!cellType || cellType === enemyVirusType) {
          result.add(cellCode);
        }
      });
    });

    // Check colony cells
    colonyContainer
      .filter((colonySet) => colonySet.activated)
      .forEach((colonySet) => {
        colonySet.getCellCodes().forEach((cellCode) => {
          const adjacentColonyCellCodes = getAdjacentCellCodes(cellCode);
          adjacentColonyCellCodes.forEach((cellCode) => {
            const cellType = getCellType(cellCode);
            if (!cellType || cellType === enemyVirusType) {
              result.add(cellCode);
            }
          });
        });
      });

    return Array.from(result);
  };

  const availableCellCodes = calculateAvailableCells();

  return {
    availableCellCodes,
    count: availableCellCodes.length,
    updateAvailableCells: calculateAvailableCells, // For manual refresh if needed
  };
}



