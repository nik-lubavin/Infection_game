// import { useState } from "react";
// import { ColonyContainer } from "../classes/ColonyContainer";
import { PlayerType } from "../interfaces/Board";
import { ICell } from "../classes/Cell";
import { useBoard } from "./useBoard";
import { ColonySet } from "../classes/ColonySet";

export function useColonyManager() {
  // const [redColonyContainer, setRedColonyContainer] = useState<ColonyContainer>(
  //   new ColonyContainer(PlayerType.RED)
  // );
  // const [blueColonyContainer, setBlueColonyContainer] =
  //   useState<ColonyContainer>(new ColonyContainer(PlayerType.BLUE));

  const { board } = useBoard();

  const addNewColonyCell = (colonyCell: ICell, playerType: PlayerType) => {
    // get adjacent ColonyCells for the same player
    const adjacentColonyCells = board.getAdjacentColonyCell(
      colonyCell,
      playerType
    );
    let colonySet: ColonySet;
    if (adjacentColonyCells.length) {
      // get ColonySets for these ColonyCells
      const colonySets = adjacentColonyCells
        .map((cell) => cell.colonySet)
        .filter(Boolean) as ColonySet[];
      colonySet = colonySets[0];
      colonySet.addCell(colonyCell);

      // TODO      if more then one ColonySets -> can be merged
    } else {
      // create a new ColonySet
      colonySet = new ColonySet([colonyCell], playerType);
    }

    colonySet.activated = true;
  };

  return {
    addNewColonyCell,
  };
}
