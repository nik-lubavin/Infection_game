import React from "react";
import { PlayerType } from "../interfaces/Board";
import CellComponent from "./Cell";
import "../styles/Board.css";
import { ICell } from "../classes/Cell";
import { Board } from "../classes/Board";

export interface BoardComponentProps {
  size: number;
  currentTurn: PlayerType;
  onCellClick: (cell: ICell) => void;
  board: Board;
  availableCellCodes: string[];
  setOutputText: React.Dispatch<React.SetStateAction<string>>;
}

function isCellAvailable(cell: ICell, availableCellCodes: string[]): boolean {
  return availableCellCodes.some((cellCode) => cellCode === cell.code);
}

const BoardComponent: React.FC<BoardComponentProps> = ({
  currentTurn,
  board,
  availableCellCodes,
  onCellClick,
  setOutputText,
}) => {
  const renderGrid = () => {
    return board.cells.map((row: ICell[]) => {
      const rowComponent = row.map((cell: ICell) => {
        const isAvailable = isCellAvailable(cell, availableCellCodes);

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
              setOutputText={setOutputText}
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
    });
  };

  return <div className="virus-grid-container">{renderGrid()}</div>;
};

export default BoardComponent;
