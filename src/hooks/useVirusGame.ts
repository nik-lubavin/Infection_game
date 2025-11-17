import { useState } from "react";
import { PlayerType } from "../interfaces/Board";
import { ICell } from "../classes/Cell";

import { useAvailableCellCodesFromContext } from "./useAvailableCellCodesFromContext";
import { useCellsFromContext } from "./useCellsFromContext";
import { useGameContext } from "../contexts/GameContext";

export function useVirusGame() {
  const [movesLeft, setMovesLeft] = useState<number>(3);
  const { board, addVirusCellCode, currentPlayer, switchPlayer } =
    useGameContext();
  const { availableCellCodes } =
    useAvailableCellCodesFromContext(currentPlayer);
  const { getCellType } = useCellsFromContext();

  const handleCellClick = (cell: ICell) => {
    const isAvailable = availableCellCodes.indexOf(cell.code) !== -1;

    if (!isAvailable) return;

    const cellType = getCellType(cell.code);

    if (cellType == null) {
      addVirusCellCode(cell.code, currentPlayer);
    } else {
      // ENEMY VIRUS
      // TODO create colony
    }

    if (movesLeft > 1) {
      setMovesLeft(movesLeft - 1);
    } else {
      setMovesLeft(3);
      switchPlayer();
    }
  };

  return {
    board,
    currentPlayer,
    movesLeft,
    availableCellCodes,
    onCellClick: handleCellClick,
  };
}
