import { ColonySet } from "../../classes/ColonySet";
import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";

export function refreshColonySets(
  gameState: GameState,
  toUpdateColonies: ColonySet[]
) {
  const redColoniesToUpdate = toUpdateColonies.filter(
    (c) => c.owner === PlayerType.RED
  );
  const blueColoniesToUpdate = toUpdateColonies.filter(
    (c) => c.owner === PlayerType.BLUE
  );

  if (redColoniesToUpdate.length > 0) {
    const redIds = redColoniesToUpdate.map((c) => c.id);
    const upd = gameState.redColonySets.filter(
      (colony: ColonySet) => !redIds.includes(colony.id)
    );
    upd.push(...redColoniesToUpdate.map((c: ColonySet) => c.clone()));
    gameState.redColonySets = upd;
  }

  if (blueColoniesToUpdate.length > 0) {
    const blueIds = blueColoniesToUpdate.map((c) => c.id);
    const upd = gameState.blueColonySets.filter(
      (colony: ColonySet) => !blueIds.includes(colony.id)
    );
    upd.push(...blueColoniesToUpdate.map((c: ColonySet) => c.clone()));
    gameState.blueColonySets = upd;
  }
}

export function addNewDeleteOldColonies(
  gameState: GameState,
  toDeleteColonies: ColonySet[],
  toAddColonies: ColonySet[],
  player: PlayerType
) {
  const toDeleteIds = toDeleteColonies.map((colony: ColonySet) => colony.id);
  if (player === PlayerType.RED) {
    const upd = gameState.redColonySets.filter(
      (colony: ColonySet) => !toDeleteIds.includes(colony.id)
    );
    upd.push(...toAddColonies.map((c: ColonySet) => c.clone()));
    gameState.redColonySets = upd;
  } else {
    const upd = gameState.blueColonySets.filter(
      (colony: ColonySet) => !toDeleteIds.includes(colony.id)
    );
    upd.push(...toAddColonies.map((c: ColonySet) => c.clone()));
    gameState.blueColonySets = upd;
  }
}
