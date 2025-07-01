import { useState } from "react";
import { PlayerType } from "../interfaces/Board";
import { CellContentType, ICell } from "../classes/Cell";

import { useColonyManager } from "./useColonyManager";
import { useBoard } from "./useBoard";
import { useAvailableCellCodes } from "./useAvailableCellCodes";
import { useCurrentPlayer } from "./useCurrentPlayer";

export function useVirusGame() {
  const { handleAddingNewColonyCell, blueColonySets, redColonySets } =
    useColonyManager();

  const { board, updateBoard } = useBoard();
  const { currentPlayer, setCurrentPlayer } = useCurrentPlayer();
  const [movesLeft, setMovesLeft] = useState<number>(3);
  const { availableCellCodes } = useAvailableCellCodes();

  const handleCellClick = (cell: ICell) => {
    const isAvailable = availableCellCodes.indexOf(cell.code) !== -1;

    if (!isAvailable) return;

    if (cell.content == null) {
      // Create a clone of the current cell with the new content
      cell.content = {
        content: CellContentType.VIRUS,
        player: currentPlayer,
      };
      board.cloneCell(cell);

      updateBoard();

      // ENEMY VIRUS
    } else if (
      cell.content?.content === CellContentType.VIRUS &&
      cell.content?.player !== currentPlayer
    ) {
      // 1. Create a clone of the current cell with the new content
      cell.content = {
        content: CellContentType.COLONY,
        player: currentPlayer,
      };

      // 2. Add the new colony cell to the board
      handleAddingNewColonyCell(cell, currentPlayer);
      board.cloneCell(cell);

      // 3. Checking if we deactivated any enemy colonies
      // const enemyPlayer =
      //   currentPlayer === PlayerType.RED ? PlayerType.BLUE : PlayerType.RED;
      // const adjacentEnemyColonyCells = board.getAdjacentColonyCells(
      //   cell,
      //   enemyPlayer
      // );

      // if (adjacentEnemyColonyCells.length) {
      //   const enemyColonySets = adjacentEnemyColonyCells
      //     .map((cell) => cell.colonySet)
      //     .filter(Boolean) as ColonySet[];

      //   enemyColonySets.forEach((colonySet) => {
      //     colonySet.checkAndUpdateActivity();
      //   });
      // }

      // Create a new board instance
      updateBoard();
      console.log("handleCellClick5", board);
    } else {
      console.log("handleCellClick ELSE");
    }

    if (movesLeft > 1) {
      setMovesLeft(movesLeft - 1);
    } else {
      setMovesLeft(3);
      setCurrentPlayer(
        currentPlayer === PlayerType.RED ? PlayerType.BLUE : PlayerType.RED
      );
    }
  };

  return {
    board,
    currentPlayer,
    movesLeft,
    availableCellCodes,
    blueColonySets,
    redColonySets,
    onCellClick: handleCellClick,
  };
}
