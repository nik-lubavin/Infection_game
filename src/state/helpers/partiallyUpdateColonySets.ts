import { ColonySet } from "../../classes/ColonySet";
import { PlayerType } from "../../interfaces/Board";
import { GameState } from "../gameState";

export function substituteColonySets(
  gameState: GameState,
  toUpdateColonies: ColonySet[]
) {
  const toUpdateIds = toUpdateColonies.map((colony: ColonySet) => colony.id);
  if (gameState.currentPlayer === PlayerType.RED) {
    const upd = gameState.redColonySets.filter(
      (colony: ColonySet) => !toUpdateIds.includes(colony.id)
    );
    upd.push(...toUpdateColonies.map((c: ColonySet) => c.clone()));
    gameState.redColonySets = upd;
  } else {
    const upd = gameState.blueColonySets.filter(
      (colony: ColonySet) => !toUpdateIds.includes(colony.id)
    );
    upd.push(...toUpdateColonies.map((c: ColonySet) => c.clone()));
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
