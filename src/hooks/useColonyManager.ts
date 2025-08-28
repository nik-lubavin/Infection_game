import { useState, useEffect } from "react";
// import { ColonyContainer } from "../classes/ColonyContainer";
import { PlayerType } from "../interfaces/Board";
import { ICell } from "../classes/Cell";
import { ColonySet } from "../classes/ColonySet";
import { Board } from "../classes/Board";
import { useBoard } from "./useBoard";

export function useColonyManager(board: Board) {
  const [redColonySets, setRedColonySets] = useState<ColonySet[]>([]);
  const [blueColonySets, setBlueColonySets] = useState<ColonySet[]>([]);
  const { updateCloneBoard } = useBoard();

  useEffect(() => {
    // console.log("useColonyManager board updated", board.version);
  }, [board]);

  const _getAdjacentColonySets = (
    colonyCell: ICell,
    currentPlayer: PlayerType
  ): ColonySet[] => {
    const adjacentColonyCells = board.getAdjacentColonyCells(
      colonyCell,
      currentPlayer
    );
    // console.log("_getAdjacentColonySets", adjacentColonyCells, board);
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

  const handle_NewColonyCellCreated = (
    colonyCell: ICell,
    currentPlayer: PlayerType
  ) => {
    // 1. Adding / creating friendly colony set
    const adjacentColonySets = _getAdjacentColonySets(
      colonyCell,
      currentPlayer
    );
    let mainColonySet: ColonySet;

    if (!adjacentColonySets.length) {
      // create a new ColonySet
      mainColonySet = new ColonySet(
        [colonyCell.code],
        currentPlayer,
        true,
        board
      );
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

    // 2. working with enemy colonies perhaps deactivated
    const enemyPlayer =
      currentPlayer === PlayerType.RED ? PlayerType.BLUE : PlayerType.RED;
    const enemyColonySets = _getAdjacentColonySets(colonyCell, enemyPlayer);
    console.log("2 enemyColonySets", enemyColonySets);
    if (enemyColonySets.length) {
      enemyColonySets.forEach((colonySet) => {
        _checkFixPossibleSetDeactivation(colonySet);
      });
    }
  };

  const _deactivateRedColonySet = (colonySet: ColonySet) => {
    const rest = redColonySets.filter((set) => set !== colonySet);

    const newSet = colonySet.clone();
    newSet.activated = false;

    setRedColonySets([...rest, newSet]);

    board.getAllCellsByColonySet(colonySet).forEach((cell) => {
      cell.colonySet = newSet;
    });
    updateCloneBoard();
  };

  const _deactivateBlueColonySet = (colonySet: ColonySet) => {
    const rest = blueColonySets.filter((set) => set !== colonySet);
    const newSet = colonySet.clone();
    newSet.activated = false;
    setBlueColonySets([...rest, newSet]);
  };

  const _checkFixPossibleSetDeactivation = (colonySet: ColonySet) => {
    const shouldBeActive = colonySet.checkActivity(board);
    console.log("checkPossibleSetDeactivation", {
      colonySet,
      shouldBeActive,
      activated: colonySet.activated,
    });
    if (colonySet.activated !== shouldBeActive) {
      if (colonySet.playerType === PlayerType.RED) {
        _deactivateRedColonySet(colonySet);
      } else {
        _deactivateBlueColonySet(colonySet);
      }
    }
  };

  return {
    blueColonySets,
    redColonySets,
    handle_NewColonyCellCreated,
  };
}
