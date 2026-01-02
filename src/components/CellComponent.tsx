import React, { useState, useEffect, useRef, CSSProperties } from "react";
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
  colonySet: ColonySet | null;
  cellType: CellType | null;
}

const CellComponent: React.FC<CellProps> = (props: CellProps) => {
  const {
    cell,
    onCellClick: onClick,
    isAvailable,
    currentTurn,
    cellType,
  } = props;

  const [isHovered, setIsHovered] = useState(false);
  const [animationClass, setAnimationClass] = useState<string>("");
  const prevCellTypeRef = useRef<CellType | null>(null);

  // Detect colony activation/deactivation changes
  useEffect(() => {
    const prevCellType = prevCellTypeRef.current;

    if (prevCellType !== null && cellType !== null) {
      const wasInactive =
        prevCellType === CellType.RED_COLONY_INACTIVE ||
        prevCellType === CellType.BLUE_COLONY_INACTIVE;
      const isActive =
        cellType === CellType.RED_COLONY_ACTIVE ||
        cellType === CellType.BLUE_COLONY_ACTIVE;
      const wasActive =
        prevCellType === CellType.RED_COLONY_ACTIVE ||
        prevCellType === CellType.BLUE_COLONY_ACTIVE;
      const isInactive =
        cellType === CellType.RED_COLONY_INACTIVE ||
        cellType === CellType.BLUE_COLONY_INACTIVE;

      if (wasInactive && isActive) {
        // Colony activated
        setAnimationClass("colony-activating");
        const timer = setTimeout(() => setAnimationClass(""), 600);
        return () => clearTimeout(timer);
      } else if (wasActive && isInactive) {
        // Colony deactivated
        setAnimationClass("colony-deactivating");
        const timer = setTimeout(() => setAnimationClass(""), 600);
        return () => clearTimeout(timer);
      }
    }

    prevCellTypeRef.current = cellType;
  }, [cellType]);

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
        backgroundColor: "#ff3333",
        // border: "2px solid #ff3333",
      };
    } else if (cellType === CellType.RED_COLONY_INACTIVE) {
      return {
        ...commonStyle,
        borderRadius: "10%",
        backgroundColor: "rgb(249, 166, 166)",
        // border: "2px solid rgb(249, 166, 166)",
      };
    } else if (cellType === CellType.BLUE_COLONY_ACTIVE) {
      return {
        ...commonStyle,
        borderRadius: "10%",
        backgroundColor: "#3333ff",
        // border: "2px solid #3333ff",
      };
    } else if (cellType === CellType.BLUE_COLONY_INACTIVE) {
      return {
        ...commonStyle,
        borderRadius: "10%",
        backgroundColor: "rgb(152, 152, 248)",
        // border: "2px solid rgb(152, 152, 248)",
      };
    } else {
      return undefined;
    }
  };

  const contentStyle = getCellContentStyle(cellType);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    if (isAvailable && onClick) {
      onClick(cell);
    }
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
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {cellType && (
        <div
          className={animationClass}
          style={{ ...contentStyle, pointerEvents: "none" }}
        />
      )}
    </div>
  );
};

export default CellComponent;
