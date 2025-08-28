import { useCallback, useEffect, useState } from "react";
import { PlayerType } from "../interfaces/Board";
import { CellContentType } from "../classes/Cell";
import { Board } from "../classes/Board";

export function useAvailableCellCodes(board: Board, currentPlayer: PlayerType) {
  const [availableCellCodes, setAvailableCellCodes] = useState<string[]>([]);

  const _getAvailableCellCodes = useCallback((): string[] => {
    const availableCellCodes: string[] = [];
    const virusCells = board.getVirusCells(currentPlayer);

    if (!virusCells.length) {
      const startingCell = board.getStartingCell(currentPlayer);
      availableCellCodes.push(startingCell.code);
      return availableCellCodes;
    }

    const enemyPlayer =
      currentPlayer === PlayerType.RED ? PlayerType.BLUE : PlayerType.RED;

    virusCells.forEach((virusCell) => {
      const adjacentCells = board.getAdjacentCells(virusCell.code);
      adjacentCells.forEach((cell) => {
        if (
          cell.content == null ||
          (cell.content?.content === CellContentType.VIRUS &&
            cell.content?.player === enemyPlayer)
        ) {
          availableCellCodes.push(cell.code);
        }
      });
    });

    const activeColonyCells = board.getColonyCells(currentPlayer, true);
    activeColonyCells.forEach((cell) => {
      const adjacentCells = board.getAdjacentCells(cell.code);
      const availableAdjacentCells = adjacentCells.filter(
        (cell) =>
          cell.content == null ||
          (cell.content?.content === CellContentType.VIRUS &&
            cell.content?.player === enemyPlayer)
      );
      availableCellCodes.push(
        ...availableAdjacentCells.map((cell) => cell.code)
      );
    });

    return Array.from(new Set(availableCellCodes));
  }, [board, currentPlayer]);

  const updateAvailableCellCodes = useCallback(() => {
    console.log("updateAvailableCells");
    const newAvailableCellCodes = _getAvailableCellCodes();
    if (!newAvailableCellCodes.length) {
      newAvailableCellCodes.push(board.getStartingCell(currentPlayer).code);
    }
    setAvailableCellCodes(newAvailableCellCodes);
  }, [_getAvailableCellCodes, board, currentPlayer]);

  useEffect(() => {
    updateAvailableCellCodes();
  }, [updateAvailableCellCodes]);

  return { availableCellCodes, updateAvailableCellCodes };
}
