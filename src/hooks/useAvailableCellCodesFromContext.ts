import { useCallback, useState } from "react";
import { PlayerType } from "../interfaces/Board";
import { useGameContext } from "../contexts/GameContext";
import { useCellsFromContext } from "./useCellsFromContext";
import { CellType } from "../enums/CellType";

export function useAvailableCellCodesFromContext(currentPlayer: PlayerType) {
  const [availableCellCodes, setAvailableCellCodes] = useState<string[]>([]);

  const {
    redVirusCellCodes,
    blueVirusCellCodes,
    redColonySets,
    blueColonySets,
    // getAdjacentCellCodes,
  } = useGameContext();

  const { getCellType, getAdjacentCellCodes } = useCellsFromContext();

  const updateAvailableCellCodes = useCallback(() => {
    const virusContainer =
      currentPlayer === PlayerType.RED ? redVirusCellCodes : blueVirusCellCodes;
    const enemyVirusType =
      currentPlayer === PlayerType.RED
        ? CellType.BLUE_VIRUS
        : CellType.RED_VIRUS;

    const colonyContainer =
      currentPlayer === PlayerType.RED ? redColonySets : blueColonySets;
    const result: Set<string> = new Set();

    virusContainer.forEach((virusCellCode) => {
      const adjacentVirusCellCodes = getAdjacentCellCodes(virusCellCode);
      adjacentVirusCellCodes.forEach((cellCode) => {
        const cellType = getCellType(cellCode);
        if (!cellType || cellType === enemyVirusType) {
          result.add(cellCode);
        }
      });
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

    setAvailableCellCodes(Array.from(result));
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
    updateAvailableCellCodes,
    availableCellCodes,
  };
}
