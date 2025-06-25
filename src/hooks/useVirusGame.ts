import { useState, useCallback, useEffect } from "react";
import { PlayerType } from "../interfaces/Board";
import { CellContentType, ICell } from "../classes/Cell";
import { Board } from "../classes/Board";
// import { GRID_SIZE } from "../constants/board";
import { useColonyManager } from "./useColonyManager";
import { useBoard } from "./useBoard";
import { ColonySet } from "../classes/ColonySet";

// class Colony {
//   static newId = 0;

//   id: number;
//   playerType: PlayerType;
//   cells: ICell[];
//   activated: boolean;

//   constructor(playerType: PlayerType, cells: ICell[] = []) {
//     this.id = Colony.newId++;
//     this.playerType = playerType;
//     this.cells = cells;
//     this.activated = false;
//   }
// }

export function useVirusGame() {
  const { handleAddingNewColonyCell, colonySets } = useColonyManager();

  const { board, updateBoard } = useBoard();
  const [availableCells, setAvailableCells] = useState<ICell[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerType>(
    PlayerType.RED
  );
  const [movesLeft, setMovesLeft] = useState<number>(3);

  // Calculate available cells based on current state
  const calculateAvailableCells = useCallback(
    (currentPlayer: PlayerType, currentBoard: Board): ICell[] => {
      const availableCells: ICell[] = [];
      const virusCells = currentBoard.getVirusCells(currentPlayer);

      const enemyVirus =
        currentPlayer === PlayerType.RED
          ? CellContentType.BLUE_VIRUS
          : CellContentType.RED_VIRUS;

      if (!virusCells.length) {
        const startingCell = currentBoard.getStartingCell(currentPlayer);
        availableCells.push(startingCell);
        return availableCells;
      }

      virusCells.forEach((virusCell) => {
        const adjacentCells = currentBoard.getAdjacentCells(virusCell);
        adjacentCells.forEach((cell) => {
          if (cell.content == null || cell.content === enemyVirus) {
            availableCells.push(cell);
          }
        });
      });

      // const joinedColonies = currentBoard.getJoinedColonies(currentPlayer);

      return Array.from(new Set(availableCells));
    },
    []
  );

  // Update available cells when game state changes
  useEffect(() => {
    setAvailableCells(calculateAvailableCells(currentPlayer, board));
  }, [currentPlayer, board, calculateAvailableCells]);

  const handleCellClick = (cell: ICell) => {
    const isAvailable = availableCells.indexOf(cell) !== -1;
    if (!isAvailable) return;

    const enemyVirus =
      currentPlayer === PlayerType.RED
        ? CellContentType.BLUE_VIRUS
        : CellContentType.RED_VIRUS;

    if (cell.content == null) {
      // Create a clone of the current cell with the new content
      cell.content =
        currentPlayer === PlayerType.RED
          ? CellContentType.RED_VIRUS
          : CellContentType.BLUE_VIRUS;

      // Create a new board instance
      updateBoard();
    } else if (cell.content === enemyVirus) {
      // Here we replace the enemy virus with our colony

      // 1. Create a clone of the current cell with the new content
      cell.content =
        currentPlayer === PlayerType.RED
          ? CellContentType.RED_COLONY
          : CellContentType.BLUE_COLONY;

      // 2. Add the new colony cell to the board
      handleAddingNewColonyCell(cell, currentPlayer);

      // 3. Get adjacent enemy colony cells to this cell if any
      const enemyPlayer =
        currentPlayer === PlayerType.RED ? PlayerType.BLUE : PlayerType.RED;
      const adjacentEnemyColonyCells = board.getAdjacentColonyCells(
        cell,
        enemyPlayer
      );

      if (adjacentEnemyColonyCells.length) {
        const enemyColonySets = adjacentEnemyColonyCells
          .map((cell) => cell.colonySet)
          .filter(Boolean) as ColonySet[];

        enemyColonySets.forEach((colonySet) => {
          colonySet.checkAndUpdateActivity();
        });
      }

      // Create a new board instance
      updateBoard();
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
    availableCells,
    colonySets,
    onCellClick: handleCellClick,
  };
}
