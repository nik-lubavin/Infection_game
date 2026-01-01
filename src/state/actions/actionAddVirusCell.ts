import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";
import { getAvailableCellCodes } from "../helpers/getAvailableCellCodes";
import { updateColonyActivations } from "../helpers/checkColonyActivation";

export function actionAddVirusCell(
  cellCode: string,
  player: PlayerType,
  state: GameState
): GameState {
  const key =
    player === PlayerType.RED ? "redVirusCellCodes" : "blueVirusCellCodes";
  const existingArray = state[key];
  const value = existingArray.includes(cellCode) 
    ? existingArray 
    : [...existingArray, cellCode];
  const newState = {
    ...state,
    [key]: value,
  };

  // Update colony activations after adding virus (might reactivate colonies)
  const updatedColonies = updateColonyActivations(
    newState.redColonySets,
    newState.blueColonySets,
    newState.redVirusCellCodes,
    newState.blueVirusCellCodes
  );
  newState.redColonySets = updatedColonies.redColonySets;
  newState.blueColonySets = updatedColonies.blueColonySets;

  newState.availableCellCodes = getAvailableCellCodes(newState);

  return newState;
}
