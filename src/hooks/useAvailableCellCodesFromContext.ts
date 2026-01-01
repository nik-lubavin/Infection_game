import { useMemo } from "react";
import { PlayerType } from "../interfaces/Board";
import { useAppSelector } from "../store/hooks";
import { useCells } from "./useCells";
import { CellType } from "../enums/CellType";

export function useAvailableCellCodes(currentPlayer: PlayerType) {
  const { redVirusCellCodes, blueVirusCellCodes, redColonySets, blueColonySets } =
    useAppSelector((state) => state.game);

  const { getCellType, getAdjacentCellCodes } = useCells();

  const availableCellCodes = useMemo(() => {
    const virusContainer =
      currentPlayer === PlayerType.RED ? redVirusCellCodes : blueVirusCellCodes;
    const enemyVirusContainer =
      currentPlayer === PlayerType.RED ? blueVirusCellCodes : redVirusCellCodes;
    const enemyVirusType =
      currentPlayer === PlayerType.RED
        ? CellType.BLUE_VIRUS
        : CellType.RED_VIRUS;

    const colonyContainer =
      currentPlayer === PlayerType.RED ? redColonySets : blueColonySets;
    const result: Set<string> = new Set();

    virusContainer.forEach((virusCellCode: string) => {
      const adjacentVirusCellCodes = getAdjacentCellCodes(virusCellCode);
      adjacentVirusCellCodes.forEach((cellCode) => {
        const cellType = getCellType(cellCode);
        if (!cellType || cellType === enemyVirusType) {
          result.add(cellCode);
        }
      });
      
      // Also check for enemy virus cells directly adjacent to this virus
      const [rowStr, colStr] = virusCellCode.split("-");
      const row = parseInt(rowStr);
      const col = parseInt(colStr);
      
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          
          const newRow = row + dr;
          const newCol = col + dc;
          const adjacentCellCode = `${newRow}-${newCol}`;
          
          // Check if this adjacent cell is an enemy virus
          if (enemyVirusContainer.includes(adjacentCellCode)) {
            result.add(adjacentCellCode);
          }
        }
      }
    });

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
  }, [
    currentPlayer,
    redVirusCellCodes,
    blueVirusCellCodes,
    redColonySets,
    blueColonySets,
    getAdjacentCellCodes,
    getCellType,
  ]);

  return {
    availableCellCodes,
  };
}
