import { useGameContext } from "../contexts/GameContext";

// Simple hook that extracts Blue colonies data from state
export function useBlueColonies() {
  const { blueColonySets } = useGameContext();
  
  // Transform the data for UI consumption
  const blueColoniesData = blueColonySets.map((colonySet, index) => ({
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
    blueColonySets,
    blueColoniesData,
    count: blueColonySets.length,
    activeCount: blueColonySets.filter(set => set.activated).length,
  };
}

