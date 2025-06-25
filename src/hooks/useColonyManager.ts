import { useState } from "react";
// import { ColonyContainer } from "../classes/ColonyContainer";
import { PlayerType } from "../interfaces/Board";
import { ICell } from "../classes/Cell";
import { useBoard } from "./useBoard";
import { ColonySet } from "../classes/ColonySet";

export function useColonyManager() {
  const { board } = useBoard();
  const [colonySets, setColonySets] = useState<ColonySet[]>([]);

  const handleAddingNewColonyCell = (
    colonyCell: ICell,
    currentPlayer: PlayerType
  ) => {
    // Checking if there are friendly colonies near  this cell
    const adjacentColonyCells = board.getAdjacentColonyCells(
      colonyCell,
      currentPlayer
    );

    let colonySet: ColonySet;
    if (adjacentColonyCells.length) {
      // If there colonies - we get their ColonySet reference
      // and add this cell to the existing ColonySet
      const colonySets = adjacentColonyCells
        .map((cell) => cell.colonySet)
        .filter(Boolean) as ColonySet[];
      colonySet = colonySets[0];
      colonySet.addCell(colonyCell);

      // update cell += ColonySet reference
      colonyCell.colonySet = colonySet;

      // TODO      if more then one ColonySets -> can be merged
    } else {
      // create a new ColonySet
      colonySet = new ColonySet([colonyCell], currentPlayer);
      setColonySets([...colonySets, colonySet]);
      
      // update cell += ColonySet reference
      colonyCell.colonySet = colonySet;
    }

    colonySet.activated = true;
  };

  return {
    handleAddingNewColonyCell,
    colonySets,
  };
}
