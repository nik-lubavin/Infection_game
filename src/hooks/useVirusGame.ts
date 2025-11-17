import { useEffect } from "react";
import { PlayerType } from "../interfaces/Board";
import { ICell } from "../classes/Cell";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  initializeGame,
  addVirusCell,
  addCellToColony,
  switchPlayer,
  decrementMoves,
  resetMoves,
} from "../store/gameSlice";
import { useAvailableCellCodesFromContext } from "./useAvailableCellCodesFromContext";
import { useCellsFromContext } from "./useCellsFromContext";

export function useVirusGame() {
  const dispatch = useAppDispatch();
  const { board, currentPlayer, movesLeft } = useAppSelector((state) => state.game);
  const { availableCellCodes } = useAvailableCellCodesFromContext(currentPlayer);
  const { getCellType } = useCellsFromContext();

  // Initialize game on mount
  useEffect(() => {
    dispatch(initializeGame());
  }, [dispatch]);

  const handleCellClick = (cell: ICell) => {
    const isAvailable = availableCellCodes.indexOf(cell.code) !== -1;

    if (!isAvailable) return;

    const cellType = getCellType(cell.code);

    if (cellType == null) {
      dispatch(addVirusCell({ cellCode: cell.code, player: currentPlayer }));
    } else {
      // ENEMY VIRUS
      // TODO create colony
      dispatch(addCellToColony({ cellCode: cell.code, player: currentPlayer }));
    }

    if (movesLeft > 1) {
      dispatch(decrementMoves());
    } else {
      dispatch(resetMoves());
      dispatch(switchPlayer());
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
