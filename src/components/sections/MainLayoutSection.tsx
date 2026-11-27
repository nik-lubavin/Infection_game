import React from 'react';
import { Layout } from 'antd';
import { DEFAULT_GRID_SIZE } from '@infection-game/shared';
import Sidebar from '../Sidebar';
import BoardComponent from '../BoardComponent';
import { CELL_SIZE } from '../../constants/board';
import type { SessionState } from '../../session/sessionReducer';
import '../../styles/Board.css';

const { Content } = Layout;

const containerPadding = 20;
const placeholderSize = CELL_SIZE * DEFAULT_GRID_SIZE;

export interface MainLayoutSectionProps {
  sidebarCollapsed: boolean;
  session: SessionState;
}

const MainLayoutSection: React.FC<MainLayoutSectionProps> = ({ sidebarCollapsed, session }) => {
  const { game, room, yourSide } = session;
  // The board appears once the game has started; a waiting room shows the start modal instead.
  const board =
    game !== null && room !== null && room.status !== 'waiting' && yourSide !== null ? (
      <BoardComponent game={game} yourSide={yourSide} />
    ) : null;

  return (
    <Layout style={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
      <Sidebar collapsed={sidebarCollapsed} />
      <Content
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'auto',
          flexGrow: 1,
        }}
      >
        <div
          style={{
            background: '#fff',
            padding: containerPadding,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            borderRadius: '4px',
          }}
        >
          {board ?? (
            <div
              className="virus-grid-container virus-grid-container--placeholder"
              style={{ width: placeholderSize, height: placeholderSize }}
            >
              <p className="virus-grid-placeholder-text">Join or create a room to see the board.</p>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default MainLayoutSection;
