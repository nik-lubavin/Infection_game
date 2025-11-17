import React from "react";
import "./App.css";
import HomePage from "./pages/HomePage";
import { GameProvider } from "./contexts/GameContext";

// Import Ant Design styles
import "antd/dist/reset.css";

function App() {
  return (
    <div className="App">
      <GameProvider>
        <HomePage />
      </GameProvider>
    </div>
  );
}

export default App;
