import { ColonySet } from "../../classes/ColonySet";
import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";

/**
 * Returns a new GameState with updated colonies.
 * Does not mutate the input state.
 */
export function refreshColonySets(
  gameState: GameState,
  toUpdateColonies: ColonySet[]
): GameState {
  const redColoniesToUpdate = toUpdateColonies.filter(
    (c) => c.owner === PlayerType.RED
  );
  const blueColoniesToUpdate = toUpdateColonies.filter(
    (c) => c.owner === PlayerType.BLUE
  );

  let updatedRedColonies = gameState.redColonySets;
  let updatedBlueColonies = gameState.blueColonySets;

  if (redColoniesToUpdate.length > 0) {
    const redColonyIDsToUpdate = redColoniesToUpdate.map((c) => c.id);
    updatedRedColonies = [
      ...gameState.redColonySets.filter(
        (colony: ColonySet) => !redColonyIDsToUpdate.includes(colony.id)
      ),
      // Colonies are already cloned in action functions, so use them directly
      ...redColoniesToUpdate,
    ];
  }

  if (blueColoniesToUpdate.length > 0) {
    const blueIds = blueColoniesToUpdate.map((c) => c.id);
    updatedBlueColonies = [
      ...gameState.blueColonySets.filter(
        (colony: ColonySet) => !blueIds.includes(colony.id)
      ),
      // Colonies are already cloned in action functions, so use them directly
      ...blueColoniesToUpdate,
    ];
  }

  return {
    ...gameState,
    redColonySets: updatedRedColonies,
    blueColonySets: updatedBlueColonies,
  };
}

/**
 * Returns a new GameState with colonies added/deleted.
 * Does not mutate the input state.
 */
export function addNewDeleteOldColonies(
  gameState: GameState,
  toDeleteColonies: ColonySet[],
  toAddColonies: ColonySet[]
): GameState {
  const toDeleteRedIds = toDeleteColonies
    .filter((colony: ColonySet) => colony.owner === PlayerType.RED)
    .map((colony: ColonySet) => colony.id);
  const toDeleteBlueIds = toDeleteColonies
    .filter((colony: ColonySet) => colony.owner === PlayerType.BLUE)
    .map((colony: ColonySet) => colony.id);

  if (toDeleteRedIds.length > 0) {
    const updatedRedColonies = [
      // remove colonies to delete
      ...gameState.redColonySets.filter(
        (colony: ColonySet) => !toDeleteRedIds.includes(colony.id)
      ),
      // Colonies are already cloned in action functions, so use them directly
      ...toAddColonies,
    ];
    return {
      ...gameState,
      redColonySets: updatedRedColonies,
    };
  }

  if (toDeleteBlueIds.length > 0) {
    const updatedBlueColonies = [
      // remove colonies to delete
      ...gameState.blueColonySets.filter(
        (colony: ColonySet) => !toDeleteBlueIds.includes(colony.id)
      ),
      // Colonies are already cloned in action functions, so use them directly
      ...toAddColonies,
    ];
    return {
      ...gameState,
      blueColonySets: updatedBlueColonies,
    };
  }

  return gameState;
}
