import { useState } from "react";
import { PlayerType } from "../interfaces/Board";

export function useVirusCellCodes() {
  const [redVirusCellCodes, setRedVirusCellCodes] = useState<Set<string>>(
    new Set()
  );
  const [blueVirusCellCodes, setBlueVirusCellCodes] = useState<Set<string>>(
    new Set()
  );

  function addVirusCellCode(cellCode: string, currentPlayer: PlayerType) {
    if (currentPlayer === PlayerType.RED) {
      setRedVirusCellCodes(prev => new Set(prev).add(cellCode));
    } else {
      setBlueVirusCellCodes(prev => new Set(prev).add(cellCode));
    }
  }

  return {
    redVirusCellCodes,
    blueVirusCellCodes,
    addVirusCellCode,
  };
}
