import React from 'react';
import { Layout } from 'antd';
import { DEFAULT_GRID_SIZE } from '@infection-game/shared';
import Sidebar from '../Sidebar';
import { CELL_SIZE } from '../../constants/board';
import '../../styles/Board.css';

const { Content } = Layout;

const containerPadding = 20;
const placeholderSize = CELL_SIZE * DEFAULT_GRID_SIZE;

export interface MainLayoutSectionProps {
  sidebarCollapsed: boolean;
}

const MainLayoutSection: React.FC<MainLayoutSectionProps> = ({ sidebarCollapsed }) => (
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
          width: `${placeholderSize + 2 * containerPadding}px`,
          height: `${placeholderSize + 2 * containerPadding}px`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          borderRadius: '4px',
        }}
      >
        <div className="virus-grid-container virus-grid-container--placeholder">
          <p className="virus-grid-placeholder-text">Join or create a room to see the board.</p>
        </div>
      </div>
    </Content>
  </Layout>
);

export default MainLayoutSection;
