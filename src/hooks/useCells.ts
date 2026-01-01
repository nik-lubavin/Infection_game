import { ColonySet } from "../classes/ColonySet";
import { useAppSelector } from "../store/hooks";
import { helperGetAdjacentCellCodes } from "../state/helpers/getAdjacentCellCodes";

export enum CellType {
  RED_VIRUS = "red_virus",
  BLUE_VIRUS = "blue_virus",
  RED_COLONY_ACTIVE = "red_colony_active",
  RED_COLONY_INACTIVE = "red_colony_inactive",
  BLUE_COLONY_ACTIVE = "blue_colony_active",
  BLUE_COLONY_INACTIVE = "blue_colony_inactive",
}

export function useCells() {
  const { redVirusCellCodes, blueVirusCellCodes, redColonySets, blueColonySets } =
    useAppSelector((state) => state.game);

  function getCellType(cellCode: string): CellType | null {
    if (redVirusCellCodes.includes(cellCode)) {
      return CellType.RED_VIRUS;
    } else if (blueVirusCellCodes.includes(cellCode)) {
      return CellType.BLUE_VIRUS;
    } else {
      const redColonySet = redColonySets.find((set) =>
        set.colonyCellsCodes.has(cellCode)
      );
      if (redColonySet) {
        return redColonySet.activated
          ? CellType.RED_COLONY_ACTIVE
          : CellType.RED_COLONY_INACTIVE;
      }

      const blueColonySet = blueColonySets.find((set) =>
        set.colonyCellsCodes.has(cellCode)
      );
      if (blueColonySet) {
        return blueColonySet.activated
          ? CellType.BLUE_COLONY_ACTIVE
          : CellType.BLUE_COLONY_INACTIVE;
      }

      return null;
    }
  }

  function getAdjacentCellCodes(cellCode: string): string[] {
    return helperGetAdjacentCellCodes(cellCode, {
      redVirusCellCodes: new Set(redVirusCellCodes),
      blueVirusCellCodes: new Set(blueVirusCellCodes),
      redColonySets,
      blueColonySets,
    });
  }

  function getCellColonySet(cellCode: string): ColonySet | null {
    const redColonySet = redColonySets.find((set) =>
      set.colonyCellsCodes.has(cellCode)
    );
    if (redColonySet) {
      return redColonySet;
    }

    const blueColonySet = blueColonySets.find((set) =>
      set.colonyCellsCodes.has(cellCode)
    );
    if (blueColonySet) {
      return blueColonySet;
    }

    return null;
  }

  return { getCellType, getCellColonySet, getAdjacentCellCodes };
}
