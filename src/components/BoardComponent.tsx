import React from 'react';
import { Layout } from 'antd';
import { PlayerType } from '../interfaces/Board';
import CellComponent from './CellComponent';
import '../styles/Board.css';
import { ICell } from '../classes/Cell';
import { Board } from '../classes/Board';
import { useAppSelector } from '../store/hooks';
import { getCellType } from '../state/helpers/cellsGetters';
import { getCellColonySet, isCellAvailable } from '../state/helpers/cellsGetters';
import { CELL_SIZE, GRID_SIZE } from '../constants/board';
import { GameRoom } from '@infection-game/shared';

const { Content } = Layout;

const containerPadding = 20;

export interface BoardComponentProps {
  currentTurn: PlayerType;
  onCellClick: (cell: ICell) => void;
  board: Board;
  joinedRoom: GameRoom | null;
}

const BoardComponent: React.FC<BoardComponentProps> = ({
  currentTurn,
  board,
  onCellClick,
  joinedRoom,
}) => {
  const gameState = useAppSelector((state) => state.game);
  const gridWidth = CELL_SIZE * GRID_SIZE;
  const gridHeight = CELL_SIZE * GRID_SIZE;

  const boardInner = joinedRoom && (
    <div className="virus-grid-container">
      {board.cells.map((row: ICell[]) => {
        const rowComponent = row.map((cell: ICell) => {
          const isAvailable = isCellAvailable(cell.code, gameState);
          const cellType = getCellType(cell.code, gameState);
          const colonySet = getCellColonySet(cell.code, gameState);

          return (
            <div key={`cell-${cell.rowIdx}-${cell.colIdx}`} className="grid-cell-wrapper">
              <CellComponent
                cell={cell}
                onCellClick={onCellClick}
                isAvailable={isAvailable}
                currentTurn={currentTurn}
                cellType={cellType}
                colonySet={colonySet}
              />
            </div>
          );
        });

        const rowIdx = row[0].rowIdx;

        return (
          <div key={`row-${rowIdx}`} className="grid-row">
            {rowComponent}
          </div>
        );
      })}
    </div>
  );

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
        {boardInner}
      </div>
    </Content>
  );
};

export default BoardComponent;
