import React from 'react';
import { Layout } from 'antd';
import BoardComponent from './BoardComponent';
import { Board } from '../classes/Board';
import type { ICell } from '../classes/Cell';
import { GRID_SIZE, CELL_SIZE } from '../constants/board';
import type { PlayerType } from '../interfaces/Board';

const { Content } = Layout;

const containerPadding = 20;

export interface HomePageContentProps {
  currentTurn: PlayerType;
  onCellClick: (cell: ICell) => void;
  board: Board;
  currentRoomId: string | null;
}

const HomePageContent: React.FC<HomePageContentProps> = ({
  currentTurn,
  onCellClick,
  board,
  currentRoomId,
}) => {
  const gridWidth = CELL_SIZE * GRID_SIZE;
  const gridHeight = CELL_SIZE * GRID_SIZE;

  return (
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
          width: `${gridWidth + 2 * containerPadding}px`,
          height: `${gridHeight + 2 * containerPadding}px`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          borderRadius: '4px',
        }}
      >
        <BoardComponent
          size={GRID_SIZE}
          currentTurn={currentTurn}
          onCellClick={onCellClick}
          board={board}
          currentRoomId={currentRoomId}
        />
      </div>
    </Content>
  );
};

export default HomePageContent;
