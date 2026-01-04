import { ColonySet } from "../../classes/ColonySet";
import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";
import { getAdjacentColonies } from "../helpers/getAdjacentColonies";
import { calculateAvailableCellCodes } from "../helpers/cellsGetters";
import { refreshColonySets } from "../helpers/cellsUpdater";

export function actionAddVirusCell(
  cellCode: string,
  state: GameState
): GameState {
  // 1. Add virus cell to player
  let newState: GameState = {
    ...state,
    redVirusCellCodes:
      state.gamePhase === PlayerType.RED
        ? [...state.redVirusCellCodes, cellCode]
        : state.redVirusCellCodes,
    blueVirusCellCodes:
      state.gamePhase === PlayerType.BLUE
        ? [...state.blueVirusCellCodes, cellCode]
        : state.blueVirusCellCodes,
  };

  // 2. Check possible colony activation (for inactive)
  const { adjacentRedColonies, adjacentBlueColonies } = getAdjacentColonies(
    cellCode,
    state
  );
  const adjacentFriendlyColonies =
    state.gamePhase === PlayerType.RED
      ? adjacentRedColonies
      : adjacentBlueColonies;
  const inactive = adjacentFriendlyColonies.filter((colon) => !colon.activated);
  if (inactive.length > 0) {
    // Clone colonies before modifying to avoid mutating original state
    const toUpdate: ColonySet[] = inactive.map((colony) => {
      const cloned = colony.clone();
      cloned.activated = true;
      return cloned;
    });
    newState = refreshColonySets(newState, toUpdate);
  }

  newState = {
    ...newState,
    availableCellCodes: calculateAvailableCellCodes(newState),
  };

  return newState;
}
