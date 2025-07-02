import { useState } from "react";
import { PlayerType } from "../interfaces/Board";

export function useCurrentPlayer() {
  const [currentPlayer, setCurrentPlayer] = useState<PlayerType>(
    PlayerType.RED
  );

  return { currentPlayer, setCurrentPlayer };
} 