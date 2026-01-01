import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";
import { getAdjacentCellCodesFiltered } from "./getAdjacentCellCodes";

export function getAvailableCellCodes(state: GameState): string[] {
  const virusCellCodes =
    state.currentPlayer === PlayerType.RED
      ? state.redVirusCellCodes
      : state.blueVirusCellCodes;

  const result: Set<string> = new Set();

  virusCellCodes.forEach((virusCellCode) => {
    const adjacentVirusCellCodes = getAdjacentCellCodesFiltered(virusCellCode, {
      redVirusCellCodes: new Set(state.redVirusCellCodes),
      blueVirusCellCodes: new Set(state.blueVirusCellCodes),
      redColonySets: state.redColonySets,
      blueColonySets: state.blueColonySets,
    });
    adjacentVirusCellCodes.forEach((cellCode) => {
      result.add(cellCode);
    });
  });

  return Array.from(result);
}
