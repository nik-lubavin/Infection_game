import { useState } from "react";
import { Board } from "../classes/Board";
import { GRID_SIZE } from "../constants/board";

export function useBoard() {
  const [board, setBoard] = useState<Board>(
    Board.createBoard(GRID_SIZE, GRID_SIZE)
  );

  const updateBoard = () => {
    const newBoard = board.clone();
    setBoard(newBoard);
  };

  return {
    board,
    updateBoard,
  };
}
