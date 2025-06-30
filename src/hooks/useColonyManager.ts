import { useState } from "react";
// import { ColonyContainer } from "../classes/ColonyContainer";
import { PlayerType } from "../interfaces/Board";
import { ICell } from "../classes/Cell";
import { useBoard } from "./useBoard";
import { ColonySet } from "../classes/ColonySet";

export function useColonyManager() {
  const { board } = useBoard();
  const [redColonySets, setRedColonySets] = useState<ColonySet[]>([]);
  const [blueColonySets, setBlueColonySets] = useState<ColonySet[]>([]);

  const _getAdjacentColonySets = (
    colonyCell: ICell,
    currentPlayer: PlayerType
  ): ColonySet[] => {
    const adjacentColonyCells = board.getAdjacentColonyCells(
      colonyCell,
      currentPlayer
    );
    const colonySets = adjacentColonyCells
      .map((cell) => cell.colonySet)
      .filter(Boolean) as ColonySet[];
    return Array.from(new Set(colonySets));
  };

  const _mergeColonySets = (
    colonySetsToMerge: ColonySet[],
    mainColonySet: ColonySet,
    currentPlayer: PlayerType
  ) => {
    console.log("colonySetsToMerge", colonySetsToMerge);
    console.log("mainColonySet", mainColonySet);
    console.log("currentPlayer", currentPlayer);

    colonySetsToMerge.forEach((colonySet) => {
      colonySet.getColonyCells().forEach((cell: ICell) => {
        mainColonySet.addCell(cell);
        cell.colonySet = mainColonySet;
      });
    });

    const sets =
      currentPlayer === PlayerType.RED ? redColonySets : blueColonySets;
    const otherSets = sets.filter(
      (set) => set !== mainColonySet && !colonySetsToMerge.includes(set)
    );
    const setsUpdateFunction =
      currentPlayer === PlayerType.RED ? setRedColonySets : setBlueColonySets;
    setsUpdateFunction([...otherSets, mainColonySet]);
  };

  const handleAddingNewColonyCell = (
    colonyCell: ICell,
    currentPlayer: PlayerType
  ) => {
    const adjacentColonySets = _getAdjacentColonySets(
      colonyCell,
      currentPlayer
    );
    let mainColonySet: ColonySet;

    console.log("adjacentColonySets", adjacentColonySets);

    if (!adjacentColonySets.length) {
      // create a new ColonySet
      mainColonySet = new ColonySet([colonyCell], currentPlayer);
      if (currentPlayer === PlayerType.RED) {
        setRedColonySets([...redColonySets, mainColonySet]);
      } else {
        setBlueColonySets([...blueColonySets, mainColonySet]);
      }
      colonyCell.colonySet = mainColonySet;
    } else if (adjacentColonySets.length === 1) {
      mainColonySet = adjacentColonySets[0];
      mainColonySet.addCell(colonyCell);
      colonyCell.colonySet = mainColonySet;
    } else {
      // merge colonies
      mainColonySet = adjacentColonySets[0];
      mainColonySet.addCell(colonyCell);
      colonyCell.colonySet = mainColonySet;

      _mergeColonySets(adjacentColonySets, mainColonySet, currentPlayer);
    }

    mainColonySet.activated = true;
  };

  return {
    blueColonySets,
    redColonySets,
    handleAddingNewColonyCell,
  };
}
