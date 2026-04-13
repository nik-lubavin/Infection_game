import React from 'react';
import { Layout, Typography, Modal } from 'antd';

import HeaderSection from '../sections/HeaderSection';
import MainLayoutSection from '../sections/MainLayoutSection';
import { useVirusGame } from '../../hooks/useVirusGame';
import { useGameContext } from '../../contexts/GameContext';
import { useSocketContext } from '../../contexts/SocketContext';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { PlayerType } from '../../interfaces/Board';
import { clearLoser } from '../../store/gameSlice';
import { Board } from '../../classes/Board';

const { Footer } = Layout;

const HomePage: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useGameContext();
  const dispatch = useAppDispatch();
  const { board, gamePhase, movesLeft, onCellClick } = useVirusGame();
  const { availableCellCodes, loser } = useAppSelector((state) => state.game);

  const { stateJoinedRoom, actionLeaveRoom } = useSocketContext();
  const stateActiveRoom = null;
  const gameState = null;

  // Convert GamePhase to PlayerType for components
  const currentPlayerType: PlayerType =
    gamePhase === PlayerType.RED || gamePhase === PlayerType.BLUE ? gamePhase : PlayerType.RED; // Default to RED if game not started or over

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
      <MainLayoutSection
        sidebarCollapsed={sidebarCollapsed}
        currentPlayer={currentPlayerType}
        movesLeft={movesLeft}
        availableCellCodes={availableCellCodes}
        stateJoinedRoom={stateJoinedRoom}
        actionLeaveRoom={actionLeaveRoom}
        stateActiveRoom={stateActiveRoom}
        gameState={gameState}
        board={board as Board}
        onCellClick={onCellClick}
      />
      <Footer style={{ textAlign: 'center' }}>
        Virus Infection Game ©{new Date().getFullYear()}
      </Footer>
      <Modal
        open={loser !== null}
        title="Game Over"
        footer={null}
        closable={true}
        maskClosable={true}
        onCancel={() => dispatch(clearLoser())}
      >
        <Typography.Text style={{ fontSize: '18px' }}>
          Player {loser?.toUpperCase()} lost
        </Typography.Text>
      </Modal>
    </Layout>
  );
};

export default HomePage;
