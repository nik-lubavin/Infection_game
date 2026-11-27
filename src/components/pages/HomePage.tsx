import React from 'react';
import { Layout } from 'antd';

import HeaderSection from '../sections/HeaderSection';
import MainLayoutSection from '../sections/MainLayoutSection';
import { useGameContext } from '../../contexts/GameContext';
import { useSocketContext } from '../../contexts/SocketContext';
import GameStartModal from '../GameStartModal';

const { Footer } = Layout;

const HomePage: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useGameContext();
  const { session, playerName, actionLeaveRoom } = useSocketContext();

  return (
    <Layout
      style={{
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <HeaderSection
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <MainLayoutSection sidebarCollapsed={sidebarCollapsed} session={session} />
      <Footer style={{ textAlign: 'center' }}>
        Virus Infection Game ©{new Date().getFullYear()}
      </Footer>
      <GameStartModal
        room={session.room}
        yourSide={session.yourSide}
        playerName={playerName}
        actionLeaveRoom={actionLeaveRoom}
      />
    </Layout>
  );
};

export default HomePage;
