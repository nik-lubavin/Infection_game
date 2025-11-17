import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
} from "react";

// Secondary parameters that don't belong in Redux game state
interface SecondaryContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  outputText: string;
  setOutputText: React.Dispatch<React.SetStateAction<string>>;
}

const GameContext = createContext<SecondaryContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [outputText, setOutputText] = useState("");

  const value = {
    sidebarCollapsed,
    setSidebarCollapsed,
    outputText,
    setOutputText,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = (): SecondaryContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
