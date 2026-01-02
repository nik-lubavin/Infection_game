import React from "react";
import { PlayerType } from "../interfaces/Board";
import CellComponent from "./CellComponent";
import "../styles/Board.css";
import { ICell } from "../classes/Cell";
import { Board } from "../classes/Board";
import { useAppSelector } from "../store/hooks";
import { getCellType } from "../state/helpers/cellsGetters";
import {
  getCellColonySet,
  isCellAvailable,
} from "../state/helpers/cellsGetters";

export interface BoardComponentProps {
  size: number;
  currentTurn: PlayerType;
  onCellClick: (cell: ICell) => void;
  board: Board;
}

const BoardComponent: React.FC<BoardComponentProps> = ({
  currentTurn,
  board,
  onCellClick,
}) => {
  const gameState = useAppSelector((state) => state.game);

  return (
    <div className="virus-grid-container">
      {board.cells.map((row: ICell[]) => {
        const rowComponent = row.map((cell: ICell) => {
          const isAvailable = isCellAvailable(cell.code, gameState);
          const cellType = getCellType(cell.code, gameState);
          const colonySet = getCellColonySet(cell.code, gameState);

          return (
            <div
              key={`cell-${cell.rowIdx}-${cell.colIdx}`}
              className="grid-cell-wrapper"
            >
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
};

export default BoardComponent;
