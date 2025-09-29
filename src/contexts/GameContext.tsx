import React, { createContext, useContext, ReactNode } from "react";
import { PlayerType } from "../interfaces/Board";
import { useCurrentPlayer } from "../hooks/useCurrentPlayer";
import { useVirusCellCodes } from "../hooks/useVirusCells";
import { useColonySets } from "../hooks/useColonySets";
import { useBoard } from "../hooks/useBoard";
import { ColonySet } from "../classes/ColonySet";

interface GameContextType {
  // Current player state
  currentPlayer: PlayerType;
  setCurrentPlayer: (player: PlayerType) => void;

  // Board state
  board: any; // Replace with proper Board type
  // getAdjacentCellCodes: (cellCode: string) => string[];

  // Virus cells
  redVirusCellCodes: Set<string>;
  blueVirusCellCodes: Set<string>;
  addVirusCellCode: (cellCode: string, player: PlayerType) => void;

  // Colony sets
  redColonySets: ColonySet[];
  blueColonySets: ColonySet[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}
// RED player moves from (0,0) towards center: (0,0) -> (1,1) -> (2,2) -> (3,3)
const initialRedViruses = ["0-0", "1-1", "2-2", "3-3", "4-4", "5-5"];
// BLUE player moves from (9,9) towards center: (9,9) -> (8,8) -> (7,7) -> (6,6)
const initialBlueViruses = ["9-9", "8-8", "7-7", "6-6", "5-6", "6-5"];

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const { board } = useBoard();
  const { currentPlayer, setCurrentPlayer } = useCurrentPlayer();
  const { redVirusCellCodes, blueVirusCellCodes, addVirusCellCode } =
    useVirusCellCodes();

  const { redColonySets, blueColonySets } = useColonySets();

  // Setting initial data
  initialRedViruses.forEach((virusCode) => {
    addVirusCellCode(virusCode, PlayerType.RED);
  });
  initialBlueViruses.forEach((virusCode) => {
    addVirusCellCode(virusCode, PlayerType.BLUE);
  });

  const value = {
    currentPlayer,
    setCurrentPlayer,
    board,
    redVirusCellCodes,
    blueVirusCellCodes,
    addVirusCellCode,
    redColonySets,
    blueColonySets,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
