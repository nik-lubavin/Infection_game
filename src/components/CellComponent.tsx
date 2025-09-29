import React, { useState, CSSProperties } from "react";
import { PlayerType } from "../interfaces/Board";
import { CELL_SIZE } from "../constants/board";
import { ICell } from "../classes/Cell";
import { ColonySet } from "../classes/ColonySet";
import { CellType } from "../enums/CellType";

interface CellProps {
  cell: ICell;
  currentTurn: PlayerType;
  onCellClick?: (cell: ICell) => void;
  isAvailable: boolean;
  setOutputText: React.Dispatch<React.SetStateAction<string>>;
  colonySet: ColonySet | null;
  cellType: CellType | null;
}

const CellComponent: React.FC<CellProps> = (props: CellProps) => {
  const {
    cell,
    onCellClick: onClick,
    isAvailable,
    currentTurn,
    setOutputText,
    colonySet,
    cellType,
  } = props;

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
  const getCellContentStyle = (
    cellType: CellType | null
  ): CSSProperties | undefined => {
    if (!cellType) return undefined;

    // Common style for all cell contents
    const commonStyle: CSSProperties = {
      width: "70%",
      height: "70%",
      boxShadow: "0 0 5px rgba(0,0,0,0.3)",
    };

    // Style specific to content type
    if (cellType === CellType.RED_VIRUS) {
      return {
        ...commonStyle,
        borderRadius: "50%",
        backgroundColor: "#ff0000",
      };
    } else if (cellType === CellType.BLUE_VIRUS) {
      return {
        ...commonStyle,
        borderRadius: "50%",
        backgroundColor: "#0000ff",
      };
    } else if (cellType === CellType.RED_COLONY_ACTIVE) {
      return {
        ...commonStyle,
        borderRadius: "10%",
        backgroundColor: "#ff6666",
        border: "2px solid #ff0000",
      };
    } else if (cellType === CellType.RED_COLONY_INACTIVE) {
      return {
        ...commonStyle,
        borderRadius: "10%",
        backgroundColor: "#ff3333",
        border: "2px solidrgb(91, 12, 12)",
      };
    } else if (cellType === CellType.BLUE_COLONY_ACTIVE) {
      return {
        ...commonStyle,
        borderRadius: "10%",
        backgroundColor: "#6666ff",
        border: "2px solid #0000ff",
      };
    } else if (cellType === CellType.BLUE_COLONY_INACTIVE) {
      return {
        ...commonStyle,
        borderRadius: "10%",
        backgroundColor: "#3333ff",
        border: "2px solid #0000cc",
      };
    } else {
      return undefined;
    }
  };

  const contentStyle = getCellContentStyle(cellType);

  const handleMouseEnter = () => {
    setIsHovered(true);
    const { rowIdx, colIdx } = cell;
    const cellData = {
      rowIdx,
      colIdx,
      content: cellType,
      colonySet: colonySet
        ? {
            activated: colonySet.activated,
            playerType: colonySet.playerType,
            id: colonySet.id,
            cellsLength: colonySet?.getCellCodes().length,
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
      {cellType && <div style={contentStyle} />}
    </div>
  );
};

export default CellComponent;
