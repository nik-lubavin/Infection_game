import React from 'react';
import './App.css';
import HomePage from './components/pages/HomePage';
import { GameProvider } from './contexts/GameContext';
import { SocketProvider } from './contexts/SocketContext';
import PlayerSessionBadge from './components/PlayerSessionBadge';

// Import Ant Design styles
import 'antd/dist/reset.css';

function App() {
  return (
    <div className="App">
      <GameProvider>
        <SocketProvider>
          <PlayerSessionBadge />
          <HomePage />
        </SocketProvider>
      </GameProvider>
    </div>
  );
}

export default App;
