import React from 'react';
import { Layout } from 'antd';
import type { IGameRoom, IGameState } from '@infection-game/shared';
import type { PlayerType } from '../../interfaces/Board';
import type { ICell } from '../../classes/Cell';
import { Board } from '../../classes/Board';
import Sidebar from '../Sidebar';
import JoinedRoom from '../JoinedRoom';
import BoardComponent from '../BoardComponent';

export interface MainLayoutSectionProps {
  sidebarCollapsed: boolean;
  currentPlayer: PlayerType;
  movesLeft: number;
  availableCellCodes: string[];
  stateJoinedRoom: IGameRoom | null;
  actionLeaveRoom: (roomCode: string) => void;
  stateActiveRoom: IGameRoom | null;
  gameState: IGameState | null;
  board: Board;
  onCellClick: (cell: ICell) => void;
}

const MainLayoutSection: React.FC<MainLayoutSectionProps> = ({
  sidebarCollapsed,
  currentPlayer,
  movesLeft,
  availableCellCodes,
  stateJoinedRoom,
  actionLeaveRoom,
  stateActiveRoom,
  gameState,
  board,
  onCellClick,
}) => (
  <Layout style={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
    <Sidebar
      currentPlayer={currentPlayer}
      movesLeft={movesLeft}
      availableCellCodes={availableCellCodes}
      collapsed={sidebarCollapsed}
    />
    {stateJoinedRoom && (
      <JoinedRoom stateJoinedRoom={stateJoinedRoom} actionLeaveRoom={actionLeaveRoom} />
    )}
    {stateActiveRoom && gameState && (
      <BoardComponent
        currentTurn={currentPlayer}
        onCellClick={onCellClick}
        board={board}
        stateActiveRoom={stateActiveRoom}
        gameState={gameState}
      />
    )}
  </Layout>
);

export default MainLayoutSection;
