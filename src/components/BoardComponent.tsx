import React from "react";
import { PlayerType } from "../interfaces/Board";
import CellComponent from "./CellComponent";
import "../styles/Board.css";
import { ICell } from "../classes/Cell";
import { Board } from "../classes/Board";
import { useCells } from "../hooks/useCells";

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
  const { getCellType, getCellColonySet } = useCells();

  return (
    <div className="virus-grid-container">
      {board.cells.map((row: ICell[]) => {
        const rowComponent = row.map((cell: ICell) => {
          const isAvailable = isCellAvailable(cell, availableCellCodes);
          const cellType = getCellType(cell.code);
          const colonySet = getCellColonySet(cell.code);

          return (
            <div
              key={`cell-${cell.rowIdx}-${cell.colIdx}`}
              className="grid-cell-wrapper"
            >
              <CellComponent
                cell={cell}
                onCellClick={onCellClick}
                isAvailable={isAvailable}
                setOutputText={setOutputText}
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
