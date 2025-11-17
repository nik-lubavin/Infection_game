import { useGameContext } from "../contexts/GameContext";

// Hook that extracts core game state
export function useGameState() {
  const { 
    currentPlayer, 
    movesLeft, 
    board,
    redVirusCellCodes,
    blueVirusCellCodes,
    redColonySets,
    blueColonySets,
    addVirusCellCode,
    addCellToColony,
    switchPlayer,
    decrementMoves,
    resetMoves,
  } = useGameContext();

  return {
    // State
    currentPlayer,
    movesLeft,
    board,
    redVirusCellCodes,
    blueVirusCellCodes,
    redColonySets,
    blueColonySets,
    
    // Actions
    addVirusCellCode,
    addCellToColony,
    switchPlayer,
    decrementMoves,
    resetMoves,
    
    // Computed values
    isRedTurn: currentPlayer === "red",
    isBlueTurn: currentPlayer === "blue",
    hasMovesLeft: movesLeft > 0,
  };
}

