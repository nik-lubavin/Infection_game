import { useState, useCallback, useEffect } from "react";
import { PlayerType } from "../interfaces/Board";
import { CellContentType, ICell } from "../classes/Cell";
import { Board } from "../classes/Board";
import { GRID_SIZE } from "../constants/board";

export function useVirusGame() {
  const [board, setBoard] = useState<Board>(
    Board.createBoard(GRID_SIZE, GRID_SIZE)
  );
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
      const newCell = { ...cell };
      newCell.content =
        currentPlayer === PlayerType.RED
          ? CellContentType.RED_VIRUS
          : CellContentType.BLUE_VIRUS;

      // Create a new board instance
      const newBoard = board.clone();
      newBoard.updateCell(newCell);
      setBoard(newBoard);

      if (movesLeft > 1) {
        setMovesLeft(movesLeft - 1);
      } else {
        setMovesLeft(3);
        setCurrentPlayer(
          currentPlayer === PlayerType.RED ? PlayerType.BLUE : PlayerType.RED
        );
      }
    } else if (cell.content === enemyVirus) {
      // Create a clone of the current cell with the new content
      const newCell = { ...cell };
      newCell.content =
        currentPlayer === PlayerType.RED
          ? CellContentType.RED_COLONY
          : CellContentType.BLUE_COLONY;

      // Create a new board instance
      const newBoard = board.clone();
      newBoard.updateCell(newCell);
      setBoard(newBoard);

      if (movesLeft > 1) {
        setMovesLeft(movesLeft - 1);
      } else {
        setMovesLeft(3);
        setCurrentPlayer(
          currentPlayer === PlayerType.RED ? PlayerType.BLUE : PlayerType.RED
        );
      }
    }
  };

  return {
    board,
    currentPlayer,
    movesLeft,
    availableCells,
    onCellClick: handleCellClick,
  };
}
