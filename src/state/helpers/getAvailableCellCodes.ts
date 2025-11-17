import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";
import { helperGetAdjacentCellCodes } from "./getAdjacentCellCodes";

export function getAvailableCellCodes(state: GameState): string[] {
  const virusContainer =
    state.currentPlayer === PlayerType.RED
      ? state.redVirusCellCodes
      : state.blueVirusCellCodes;

  virusContainer.forEach((virusCellCode) => {
    const adjacentVirusCellCodes = helperGetAdjacentCellCodes(virusCellCode, {
      redVirusCellCodes: state.redVirusCellCodes,
      blueVirusCellCodes: state.blueVirusCellCodes,
      redColonySets: state.redColonySets,
      blueColonySets: state.blueColonySets,
    });
  });
}
