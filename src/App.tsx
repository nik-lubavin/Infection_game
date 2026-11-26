import React from 'react';
import { App as AntdApp } from 'antd';
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
      {/* AntdApp provides context-aware message/notification/modal; it must wrap SocketProvider. */}
      <AntdApp>
        <GameProvider>
          <SocketProvider>
            <PlayerSessionBadge />
            <HomePage />
          </SocketProvider>
        </GameProvider>
      </AntdApp>
    </div>
  );
}

export default App;
