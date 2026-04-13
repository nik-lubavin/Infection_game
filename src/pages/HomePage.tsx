import React from 'react';
import { Layout, Typography, Button, Modal } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import HomePageContent from '../components/HomePageContent';
import Sidebar from '../components/Sidebar';
import { useVirusGame } from '../hooks/useVirusGame';
import { useGameContext } from '../contexts/GameContext';
import { useSocketContext } from '../contexts/SocketContext';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { PlayerType } from '../interfaces/Board';
import { initializeNewGame, clearLoser } from '../store/gameSlice';

const { Header, Footer } = Layout;
const { Title } = Typography;

const HomePage: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useGameContext();
  const { currentRoomId } = useSocketContext();
  const dispatch = useAppDispatch();

  const { board, gamePhase, movesLeft, onCellClick } = useVirusGame();
  const { availableCellCodes, loser } = useAppSelector((state) => state.game);

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
      <Header
        style={{
          background: '#fff',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{ fontSize: '16px', width: 64, height: 64 }}
        />
        <Title level={2} style={{ margin: 0 }}>
          Virus Infection Game
        </Title>
        <Button
          type="primary"
          onClick={() => dispatch(initializeNewGame())}
          style={{ marginRight: 16 }}
        >
          Start New Game
        </Button>
      </Header>
      <Layout style={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
        <Sidebar
          currentPlayer={currentPlayerType}
          movesLeft={movesLeft}
          availableCellCodes={availableCellCodes}
          collapsed={sidebarCollapsed}
        />

        <HomePageContent
          currentTurn={currentPlayerType}
          onCellClick={onCellClick}
          board={board}
          currentRoomId={currentRoomId}
        />
      </Layout>
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
