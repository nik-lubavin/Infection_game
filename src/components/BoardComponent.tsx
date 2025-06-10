import React, { useState } from "react";
import { PlayerType } from "../interfaces/Board";
import CellComponent from "./Cell";
import "../styles/Board.css";
import { CellContentType, ICell } from "../classes/Cell";
import { Board } from "../classes/Board";

export interface BoardComponentProps {
  size: number;
  currentTurn: PlayerType;
  onCellClick: (cell: ICell) => void;
  board: Board;
  availableCells: ICell[];
}

function isCellAvailable(
  rowIdx: number,
  colIdx: number,
  availableCells: ICell[]
): boolean {
  return availableCells.some(
    (cell) => cell.rowIdx === rowIdx && cell.colIdx === colIdx
  );
}

const BoardComponent: React.FC<BoardComponentProps> = ({
  currentTurn,
  board,
  availableCells,
  onCellClick,
}) => {
  // const handleCellClick = (cell: ICell) => {
  //   const isAvailable = isCellAvailable(
  //     cell.rowIdx,
  //     cell.colIdx,
  //     availableCells
  //   );

  //   if (!isAvailable) return;

  //   if (cell.content == null) {
  //     cell.content =
  //       currentTurn === PlayerType.RED
  //         ? CellContentType.RED_VIRUS
  //         : CellContentType.BLUE_VIRUS;
  //   } else {
  //     console.log("Under development");
  //   }
  // };

  const renderGrid = () => {
    return board.cells.map((row: ICell[]) => {
      const rowComponent = row.map((cell: ICell) => {
        const isAvailable = isCellAvailable(
          cell.rowIdx,
          cell.colIdx,
          availableCells
        );

        return (
          <div
            key={`cell-${cell.rowIdx}-${cell.colIdx}`}
            className="grid-cell-wrapper"
          >
            <CellComponent
              cell={cell}
              onCellClick={onCellClick}
              isAvailable={isAvailable}
              player={currentTurn}
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
