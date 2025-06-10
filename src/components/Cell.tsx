import React, { useState, CSSProperties } from "react";
import { PlayerType } from "../interfaces/Board";
import { CELL_SIZE } from "../constants/board";
import { CellContentType, ICell } from "../classes/Cell";

interface CellProps {
  cell: ICell;
  onCellClick?: (cell: ICell) => void;
  isAvailable: boolean;
  player: PlayerType;
}

const CellComponent: React.FC<CellProps> = (props: CellProps) => {
  const { cell, onCellClick: onClick, isAvailable, player } = props;
  const { content: cellContent } = cell;
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
    if (player === PlayerType.RED) {
      backgroundColor = redBaseColor;
    } else if (player === PlayerType.BLUE) {
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
    switch (cellContent) {
      case CellContentType.RED_VIRUS:
        return {
          ...commonStyle,
          borderRadius: "50%",
          backgroundColor: "#ff0000",
        };
      case CellContentType.BLUE_VIRUS:
        return {
          ...commonStyle,
          borderRadius: "50%",
          backgroundColor: "#0000ff",
        };
      case CellContentType.RED_COLONY:
        return {
          ...commonStyle,
          borderRadius: "10%",
          backgroundColor: "#ff3333",
          border: "2px solid #cc0000",
        };
      case CellContentType.BLUE_COLONY:
        return {
          ...commonStyle,
          borderRadius: "10%",
          backgroundColor: "#3333ff",
          border: "2px solid #0000cc",
        };
      default:
        return undefined;
    }
  };

  const contentStyle = getCellContentStyle();

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {cellContent && <div style={contentStyle} />}
    </div>
  );
};

export default CellComponent;
