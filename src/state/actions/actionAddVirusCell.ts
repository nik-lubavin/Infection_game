import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";
import { getAvailableCellCodes } from "../helpers/getAvailableCellCodes";

export function actionAddVirusCell(
  cellCode: string,
  player: PlayerType,
  state: GameState
): GameState {
  const key =
    player === PlayerType.RED ? "redVirusCellCodes" : "blueVirusCellCodes";
  const existingSet = state[key];
  const value = new Set(Array.from(existingSet).concat(cellCode));
  const newState = {
    ...state,
    [key]: value,
  };

  newState.availableCellCodes = getAvailableCellCodes(newState);

  return newState;
}
