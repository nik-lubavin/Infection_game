import { useEffect, useState } from "react";
import { Board } from "../classes/Board";
import { GRID_SIZE } from "../constants/board";
import { PlayerType } from "../interfaces/Board";
import { CellContentType } from "../classes/Cell";

// Debug function to create a board with 3 moves from each player towards center
function createDebugBoard(): Board {
  // const board = Board.createBoard(GRID_SIZE, GRID_SIZE);
  const board = new Board(GRID_SIZE, GRID_SIZE);

  // RED player moves from (0,0) towards center: (0,0) -> (1,1) -> (2,2) -> (3,3)
  const redMoves = [
    { row: 0, col: 0 },
    { row: 1, col: 1 },
    { row: 2, col: 2 },
    { row: 3, col: 3 },
    { row: 4, col: 4 },
    { row: 5, col: 5 },
  ];

  // BLUE player moves from (9,9) towards center: (9,9) -> (8,8) -> (7,7) -> (6,6)
  const blueMoves = [
    { row: 9, col: 9 },
    { row: 8, col: 8 },
    { row: 7, col: 7 },
    { row: 6, col: 6 },
    { row: 5, col: 6 },
    { row: 6, col: 5 },
  ];

  // Place RED viruses
  redMoves.forEach(({ row, col }) => {
    board.cells[row][col].content = {
      content: CellContentType.VIRUS,
      player: PlayerType.RED,
    };
  });

  // Place BLUE viruses
  blueMoves.forEach(({ row, col }) => {
    board.cells[row][col].content = {
      content: CellContentType.VIRUS,
      player: PlayerType.BLUE,
    };
  });

  return board;
}

export function useBoard() {
  const [board, setBoard] = useState<Board>(createDebugBoard());
  // const { updateAvailableCells } = useAvailableCells();

  const updateBoard = () => {
    const newBoard = board.clone();
    setBoard(newBoard);
    console.log("updateBoard", newBoard.version);

    // updateAvailableCells();
  };

  // Use useEffect to perform actions when the board state changes
  useEffect(() => {
    console.log("Board state updated:", board);
  }, [board]);

  return {
    board,
    updateBoard,
  };
}
