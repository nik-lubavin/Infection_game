import { useState, useCallback, useEffect } from "react";
import { PlayerType } from "../interfaces/Board";
import { CellContentType, ICell } from "../classes/Cell";
import { Board } from "../classes/Board";
import { GRID_SIZE } from "../constants/board";
import { useColonyManager } from "./useColonyManager";
import { useBoard } from "./useBoard";

class Colony {
  static newId = 0;

  id: number;
  playerType: PlayerType;
  cells: ICell[];
  activated: boolean;

  constructor(playerType: PlayerType, cells: ICell[] = []) {
    this.id = Colony.newId++;
    this.playerType = playerType;
    this.cells = cells;
    this.activated = false;
  }
}

export function useVirusGame() {
  const { addNewColonyCell } = useColonyManager();

  // const [board, setBoard] = useState<Board>(
  //   Board.createBoard(GRID_SIZE, GRID_SIZE)
  // );
  const { board, updateBoard } = useBoard();
  const [availableCells, setAvailableCells] = useState<ICell[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerType>(
    PlayerType.RED
  );
  const [movesLeft, setMovesLeft] = useState<number>(3);
  const [redColonies, setRedColonies] = useState<Colony[]>([]);
  const [blueColonies, setBlueColonies] = useState<Colony[]>([]);

  // Calculate available cells based on current state
  const calculateAvailableCells = useCallback(
    (currentPlayer: PlayerType, currentBoard: Board): ICell[] => {
      const availableCells: ICell[] = [];
      const virusCells = currentBoard.getVirusCells(currentPlayer);

      const enemyVirus =
        currentPlayer === PlayerType.RED
          ? CellContentType.BLUE_VIRUS
          : CellContentType.RED_VIRUS;

      if (!virusCells.length) {
        const startingCell = currentBoard.getStartingCell(currentPlayer);
        availableCells.push(startingCell);
        return availableCells;
      }

      virusCells.forEach((virusCell) => {
        const adjacentCells = currentBoard.getAdjacentCells(virusCell);
        adjacentCells.forEach((cell) => {
          if (cell.content == null || cell.content === enemyVirus) {
            availableCells.push(cell);
          }
        });
      });

      const joinedColonies = currentBoard.getJoinedColonies(currentPlayer);

      return Array.from(new Set(availableCells));
    },
    []
  );

  // Update available cells when game state changes
  useEffect(() => {
    setAvailableCells(calculateAvailableCells(currentPlayer, board));
  }, [currentPlayer, board, calculateAvailableCells]);

  // Handle colony creation or update when converting enemy virus
  const manageColony = (cell: ICell, newColony: CellContentType) => {
    const currentPlayerType =
      newColony === CellContentType.RED_COLONY
        ? PlayerType.RED
        : PlayerType.BLUE;

    const [colonyObjects, setColonies] =
      currentPlayerType === PlayerType.RED
        ? [redColonies, setRedColonies]
        : [blueColonies, setBlueColonies];

    if (colonyObjects.length > 0) {
      const adjacentCells = board.getAdjacentCells(cell);
      let foundExistingColony = false;

      for (const adjacentCell of adjacentCells) {
        if (adjacentCell.content !== newColony) {
          continue;
        }

        for (const colony of colonyObjects) {
          if (colony.cells.includes(adjacentCell)) {
            colony.cells.push(cell);
            colony.activated = true;
            console.log(`Added cell to colony ${colony.id}`, {
              cell,
              colony,
            });
            foundExistingColony = true;
            break;
          }
        }

        if (foundExistingColony) break;
      }

      if (!foundExistingColony) {
        // Create new colony if no adjacent colony found
        setColonies([...colonyObjects, new Colony(currentPlayerType, [cell])]);
      } else {
        // Force update of colonies array to trigger re-render
        setColonies([...colonyObjects]);
      }
    } else {
      // Create first colony for this player
      setColonies([new Colony(currentPlayerType, [cell])]);
    }
  };

  const handleCellClick = (cell: ICell) => {
    const isAvailable = availableCells.indexOf(cell) !== -1;
    if (!isAvailable) return;

    const enemyVirus =
      currentPlayer === PlayerType.RED
        ? CellContentType.BLUE_VIRUS
        : CellContentType.RED_VIRUS;

    if (cell.content == null) {
      // Create a clone of the current cell with the new content
      // const newCell = { ...cell };
      cell.content =
        currentPlayer === PlayerType.RED
          ? CellContentType.RED_VIRUS
          : CellContentType.BLUE_VIRUS;

      // Create a new board instance
      updateBoard();
      // const newBoard = board.clone();
      // newBoard.updateCell(newCell);
      // setBoard(newBoard);
    } else if (cell.content === enemyVirus) {
      // Create a clone of the current cell with the new content
      // const newCell = { ...cell };
      // const newColonyContent =
      //   currentPlayer === PlayerType.RED
      //     ? CellContentType.RED_COLONY
      //     : CellContentType.BLUE_COLONY;
      // newCell.content = newColonyContent;
      addNewColonyCell(cell, currentPlayer);
      cell.content =
        currentPlayer === PlayerType.RED
          ? CellContentType.RED_COLONY
          : CellContentType.BLUE_COLONY;

      // Create a new board instance
      updateBoard();
      // const newBoard = board.clone();
      // newBoard.updateCell(newCell);
      // setBoard(newBoard);

      // Manage colony creation/update

      // manageColony(newCell, newColonyContent);
    }

    if (movesLeft > 1) {
      setMovesLeft(movesLeft - 1);
    } else {
      setMovesLeft(3);
      setCurrentPlayer(
        currentPlayer === PlayerType.RED ? PlayerType.BLUE : PlayerType.RED
      );
    }
  };

  return {
    board,
    currentPlayer,
    movesLeft,
    availableCells,
    onCellClick: handleCellClick,
  };
}
