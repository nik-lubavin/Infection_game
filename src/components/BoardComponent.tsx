import React, { useMemo } from 'react';
import {
  getCellType,
  phaseSide,
  type IGameState,
  type RoomPlayerSide,
} from '@infection-game/shared';
import CellComponent from './CellComponent';
import { CELL_SIZE } from '../constants/board';
import '../styles/Board.css';

export interface BoardComponentProps {
  game: IGameState;
  yourSide: RoomPlayerSide;
  onCellClick?: (cellCode: string) => void;
}

/** The grid of the game as the player sees it; draws the state and nothing else. */
const BoardComponent: React.FC<BoardComponentProps> = ({ game, yourSide, onCellClick }) => {
  // The server computes availableCellCodes for the side that moves now.
  const isMyTurn = phaseSide(game.gamePhase) === yourSide;
  const available = useMemo(() => new Set(game.availableCellCodes), [game]);
  const indexes = useMemo(
    () => Array.from({ length: game.gridSize }, (_, i) => i),
    [game.gridSize]
  );
  const size = CELL_SIZE * game.gridSize;

  return (
    <div className="virus-grid-container" style={{ width: size, height: size }}>
      {indexes.map((row) => (
        <div key={`row-${row}`} className="grid-row">
          {indexes.map((col) => {
            const cellCode = `${row}-${col}`;
            return (
              <div key={cellCode} className="grid-cell-wrapper">
                <CellComponent
                  cellCode={cellCode}
                  cellType={getCellType(game, cellCode)}
                  isAvailable={isMyTurn && available.has(cellCode)}
                  side={yourSide}
                  onClick={onCellClick}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default BoardComponent;
