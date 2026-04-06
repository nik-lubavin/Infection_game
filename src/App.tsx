import React from "react";
import "./App.css";
import HomePage from "./pages/HomePage";
import { GameProvider } from "./contexts/GameContext";
import PlayerSessionBadge from "./components/PlayerSessionBadge";

// Import Ant Design styles
import "antd/dist/reset.css";

function App() {
  return (
    <div className="App">
      <GameProvider>
        <PlayerSessionBadge />
        <HomePage />
      </GameProvider>
    </div>
  );
}

export default App;
