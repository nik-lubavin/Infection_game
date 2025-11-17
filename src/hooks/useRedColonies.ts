import { useGameContext } from "../contexts/GameContext";

// Simple hook that extracts Red colonies data from state
export function useRedColonies() {
  const { redColonySets } = useGameContext();
  
  // Transform the data for UI consumption
  const redColoniesData = redColonySets.map((colonySet, index) => ({
    id: index,
    playerType: colonySet.playerType,
    activated: colonySet.activated,
    cells: colonySet.getColonyCells().map((cell) => ({
      rowIdx: cell.rowIdx,
      colIdx: cell.colIdx,
      code: cell.code,
      content: cell.content,
    })),
  }));

  return {
    redColonySets,
    redColoniesData,
    count: redColonySets.length,
    activeCount: redColonySets.filter(set => set.activated).length,
  };
}

