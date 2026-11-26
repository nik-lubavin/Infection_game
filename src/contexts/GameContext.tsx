import React, { createContext, useContext, ReactNode, useState } from 'react';

// UI-only settings that are not part of the session state
interface SecondaryContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const GameContext = createContext<SecondaryContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const value = {
    sidebarCollapsed,
    setSidebarCollapsed,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = (): SecondaryContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
