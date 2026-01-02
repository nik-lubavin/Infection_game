import { useEffect } from "react";
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
import { isCellAvailable } from "../state/helpers/cellsGetters";
import { getCellType } from "../state/helpers/cellsGetters";

export function useVirusGame() {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector((state) => state.game);
  const { board, currentPlayer, movesLeft } = gameState;

  // Initialize game on mount
  useEffect(() => {
    dispatch(initializeGame());
  }, [dispatch]);

  const handleCellClick = (cell: ICell) => {
    const isAvailable = isCellAvailable(cell.code, gameState);

    if (!isAvailable) return;

    const cellType = getCellType(cell.code, gameState);

    if (cellType == null) {
      dispatch(addVirusCell({ cellCode: cell.code }));
    } else {
      // ENEMY VIRUS - create or add to colony
      dispatch(addCellToColony({ cellCode: cell.code }));
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
    onCellClick: handleCellClick,
  };
}
