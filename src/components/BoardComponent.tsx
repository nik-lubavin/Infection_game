import React from 'react';
import { Layout } from 'antd';
import { PlayerType } from '../interfaces/Board';
import CellComponent from './CellComponent';
import '../styles/Board.css';
import { ICell } from '../classes/Cell';
import { Board } from '../classes/Board';
import { getCellType } from '../state/helpers/cellsGetters';
import { getCellColonySet, isCellAvailable } from '../state/helpers/cellsGetters';
import { CELL_SIZE, GRID_SIZE } from '../constants/board';
import { IColonySet, IGameRoom, IGameState } from '@infection-game/shared';
import { useSocketContext } from '../contexts/SocketContext';

const { Content } = Layout;

const containerPadding = 20;

export interface BoardComponentProps {
  currentTurn: PlayerType;
  onCellClick: (cell: ICell) => void;
  board: Board;

  stateActiveRoom: IGameRoom | null;
  gameState: IGameState | null;
}

const BoardComponent: React.FC<BoardComponentProps> = (props) => {
  const { currentTurn, onCellClick, board, stateActiveRoom } = props;

  const { stateGame } = useSocketContext();

  const gridWidth = CELL_SIZE * GRID_SIZE;
  const gridHeight = CELL_SIZE * GRID_SIZE;

  const boardInner =
    stateActiveRoom != null ? (
      <div className="virus-grid-container">
        {board.cells.map((row: ICell[]) => {
          const rowComponent = row.map((cell: ICell) => {
            const isAvailable = isCellAvailable(cell.code, stateGame!);
            const cellType = getCellType(cell.code, stateGame!);
            const colonySet = getCellColonySet(cell.code, stateGame!);

            return (
              <div key={`cell-${cell.rowIdx}-${cell.colIdx}`} className="grid-cell-wrapper">
                <CellComponent
                  cell={cell}
                  onCellClick={onCellClick}
                  isAvailable={isAvailable}
                  currentTurn={currentTurn}
                  cellType={cellType}
                  colonySet={colonySet as IColonySet | null}
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
    ) : (
      <div className="virus-grid-container virus-grid-container--placeholder">
        <p className="virus-grid-placeholder-text">Join or create a room to see the board.</p>
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
