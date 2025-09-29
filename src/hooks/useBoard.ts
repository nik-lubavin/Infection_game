import { useState } from "react";
import { Board } from "../classes/Board";
import { GRID_SIZE } from "../constants/board";

export function useBoard() {
  const [board, setBoard] = useState<Board>(new Board(GRID_SIZE, GRID_SIZE));

  const updateCloneBoard = () => {
    const newBoard = board.clone();
    setBoard(newBoard);
  };

  return {
    board,
    updateCloneBoard,
  };
}
