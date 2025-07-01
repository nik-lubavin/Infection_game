import React, { useState, CSSProperties } from "react";
import { PlayerType } from "../interfaces/Board";
import { CELL_SIZE } from "../constants/board";
import { CellContentType, ICell } from "../classes/Cell";

interface CellProps {
  cell: ICell;
  onCellClick?: (cell: ICell) => void;
  isAvailable: boolean;
  currentTurn: PlayerType;
  setOutputText: React.Dispatch<React.SetStateAction<string>>;
}

const CellComponent: React.FC<CellProps> = (props: CellProps) => {
  const {
    cell,
    onCellClick: onClick,
    isAvailable,
    currentTurn,
    setOutputText,
  } = props;
  const { content: cellContent, colonySet } = cell;
  const [isHovered, setIsHovered] = useState(false);

  // Base color for all cells
  const baseColor = "#f0f0f0";

  // Base indicator colors
  const redBaseColor = "#ffeeee";
  const blueBaseColor = "#eeeeff";

  // Hover colors
  const availableHoverColor = "#c0c0c0";
  const notAvailableHoverColor = "#ddd";

  let backgroundColor = baseColor;

  if (isHovered) {
    if (isAvailable) {
      backgroundColor = availableHoverColor;
    } else {
      backgroundColor = notAvailableHoverColor;
    }
  } else if (isAvailable) {
    if (currentTurn === PlayerType.RED) {
      backgroundColor = redBaseColor;
    } else if (currentTurn === PlayerType.BLUE) {
      backgroundColor = blueBaseColor;
    }
  }

  // Determine cell content styling
  const getCellContentStyle = (): CSSProperties | undefined => {
    if (!cellContent) return undefined;

    // Common style for all cell contents
    const commonStyle: CSSProperties = {
      width: "70%",
      height: "70%",
      boxShadow: "0 0 5px rgba(0,0,0,0.3)",
    };

    // Style specific to content type
    if (
      cellContent?.content === CellContentType.VIRUS &&
      cellContent?.player === PlayerType.RED
    ) {
      return {
        ...commonStyle,
        borderRadius: "50%",
        backgroundColor: "#ff0000",
      };
    } else if (
      cellContent?.content === CellContentType.VIRUS &&
      cellContent?.player === PlayerType.BLUE
    ) {
      return {
        ...commonStyle,
        borderRadius: "50%",
        backgroundColor: "#0000ff",
      };
    } else if (
      cellContent?.content === CellContentType.COLONY &&
      cellContent?.player === PlayerType.RED
    ) {
      if (colonySet?.activated) {
        return {
          ...commonStyle,
          borderRadius: "10%",
          backgroundColor: "#ff6666",
          border: "2px solid #ff0000",
        };
      } else {
        return {
          ...commonStyle,
          borderRadius: "10%",
          backgroundColor: "#ff3333",
          border: "2px solid #cc0000",
        };
      }
    } else if (
      cellContent?.content === CellContentType.COLONY &&
      cellContent?.player === PlayerType.BLUE
    ) {
      if (colonySet?.activated) {
        return {
          ...commonStyle,
          borderRadius: "10%",
          backgroundColor: "#6666ff",
          border: "2px solid #0000ff",
        };
      } else {
        return {
          ...commonStyle,
          borderRadius: "10%",
          backgroundColor: "#3333ff",
          border: "2px solid #0000cc",
        };
      }
    } else {
      return undefined;
    }
  };

  const contentStyle = getCellContentStyle();

  const handleMouseEnter = () => {
    setIsHovered(true);
    const { rowIdx, colIdx, content, colonySet } = cell;
    const cellData = {
      rowIdx,
      colIdx,
      content,
      colonySet: colonySet
        ? {
            activated: colonySet.activated,
            playerType: colonySet.playerType,
            id: colonySet.id,
            cellsLength: colonySet.getColonyCells().length,
          }
        : null,
    };
    setOutputText(JSON.stringify(cellData, null, 2));
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setOutputText("");
  };

  return (
    <div
      style={{
        width: `${CELL_SIZE}px`,
        height: `${CELL_SIZE}px`,
        backgroundColor,
        cursor: isAvailable && onClick ? "pointer" : "default",
        transition: "background-color 0.3s",
        border: "1px solid #e8e8e8",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={() => isAvailable && onClick && onClick(cell)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {cellContent && <div style={contentStyle} />}
    </div>
  );
};

export default CellComponent;
