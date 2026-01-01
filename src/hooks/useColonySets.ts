import { useState } from "react";
import { PlayerType } from "../interfaces/Board";
import { ColonySet } from "../classes/ColonySet";
import { useCells } from "./useCells";

export function useColonySets() {
  const [redColonySets, setRedColonySets] = useState<ColonySet[]>([]);
  const [blueColonySets, setBlueColonySets] = useState<ColonySet[]>([]);

  const { getAdjacentCellCodes } = useCells();

  function addCellToColony(cellCode: string, currentPlayer: PlayerType) {
    let colonyStateContainer: ColonySet[];
    let colonyUpdateFunction: (colonySets: ColonySet[]) => void;
    if (currentPlayer === PlayerType.RED) {
      colonyStateContainer = redColonySets;
      colonyUpdateFunction = setRedColonySets;
    } else {
      colonyStateContainer = blueColonySets;
      colonyUpdateFunction = setBlueColonySets;
    }

    // setRedColonyCells((prev) => new Set(prev).add(cellCode));
    const adjacentCellCodes = getAdjacentCellCodes(cellCode);

    const adjacentColonySets: Set<ColonySet> = new Set();
    adjacentCellCodes.forEach((adjacentCellCode) => {
      const colonySet = colonyStateContainer.find((item) =>
        item.colonyCellsCodes.has(adjacentCellCode)
      );
      if (colonySet) {
        adjacentColonySets.add(colonySet);
      }
    });

    if (adjacentColonySets.size === 0) {
      const newColonySet = new ColonySet(
        new Set([cellCode]),
        currentPlayer,
        true
      );
      colonyUpdateFunction([...colonyStateContainer, newColonySet]);
    } else if (adjacentColonySets.size === 1) {
      const mainSet = Array.from(adjacentColonySets)[0];
      mainSet.addCellCodes([cellCode]);
      mainSet.activated = true;

      colonyUpdateFunction([
        ...colonyStateContainer.filter((item) => item !== mainSet),
        mainSet.clone(),
      ]);
    } else {
      // merge colonies
      const colonySetsArray = Array.from(adjacentColonySets);
      const mainSet = colonySetsArray[0];
      mainSet.addCellCodes([cellCode]);
      for (let i = 1; i < colonySetsArray.length; i++) {
        const current = colonySetsArray[i];
        mainSet.addCellCodes(current.getCellCodes());
      }
      mainSet.activated = true;
      setRedColonySets([
        ...redColonySets.filter((item) => !adjacentColonySets.has(item)),
        mainSet.clone(),
      ]);
    }
  }

  return {
    redColonySets,
    blueColonySets,
    addCellToColony,
  };
}
