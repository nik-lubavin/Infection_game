import { ColonySet } from "../../classes/ColonySet";
import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";
import { getAdjacentColonies } from "../helpers/getAdjacentColonies";
import { calculateAvailableCellCodes } from "../helpers/cellsGetters";
import { substituteColonySets as refreshColonySets } from "../helpers/partiallyUpdateColonySets";

export function actionAddVirusCell(
  cellCode: string,
  state: GameState
): GameState {
  // 0. Prepare new state
  const newState: GameState = {
    ...state,
  };

  // 1. Add virus cell to player
  if (state.currentPlayer === PlayerType.RED) {
    newState.redVirusCellCodes = [...newState.redVirusCellCodes, cellCode];
  } else {
    newState.blueVirusCellCodes = [...newState.blueVirusCellCodes, cellCode];
  }

  // 2. Check possible colony activation (for inactive)
  const { adjacentRedColonies, adjacentBlueColonies } = getAdjacentColonies(
    cellCode,
    state
  );
  const adjacentFriendlyColonies =
    state.currentPlayer === PlayerType.RED
      ? adjacentRedColonies
      : adjacentBlueColonies;
  const inactive = adjacentFriendlyColonies.filter((colon) => !colon.activated);
  if (inactive.length > 0) {
    const toUpdate: ColonySet[] = [];
    inactive.forEach((colony) => {
      colony.activated = true;
      toUpdate.push(colony);
    });
    refreshColonySets(newState, toUpdate);
  }

  newState.availableCellCodes = calculateAvailableCellCodes(newState);

  return newState;
}
