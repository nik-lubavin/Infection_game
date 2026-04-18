import { GamePhase, IColonySet, IGameState } from '@infection-game/shared';
import { PlayerType } from '@infection-game/shared';

type CellCode = string;

export enum CellType {
  RED_VIRUS = 'red_virus',
  BLUE_VIRUS = 'blue_virus',
  RED_COLONY_ACTIVE = 'red_colony_active',
  RED_COLONY_INACTIVE = 'red_colony_inactive',
  BLUE_COLONY_ACTIVE = 'blue_colony_active',
  BLUE_COLONY_INACTIVE = 'blue_colony_inactive',
}

export class ColonySet implements IColonySet {
  constructor(
    public id: number,
    public colonyCellsCodes: Set<string>,
    public activated: boolean,
    public owner: PlayerType
  ) {}
}

export class GameState {
  public gamePhase: GamePhase;
  public movesLeft: number;
  public redVirusCellCodes: string[];
  public blueVirusCellCodes: string[];
  public redColonySets: IColonySet[];
  public blueColonySets: IColonySet[];
  public gridSize: number;

  constructor({
    gamePhase,
    movesLeft,
    redVirusCellCodes,
    blueVirusCellCodes,
    redColonySets,
    blueColonySets,
    gridSize,
  }: {
    gamePhase: GamePhase;
    movesLeft: number;
    redVirusCellCodes: string[];
    blueVirusCellCodes: string[];
    redColonySets: IColonySet[];
    blueColonySets: IColonySet[];
    gridSize: number;
  }) {
    this.gamePhase = gamePhase;
    this.movesLeft = movesLeft;
    this.redVirusCellCodes = redVirusCellCodes;
    this.blueVirusCellCodes = blueVirusCellCodes;
    this.redColonySets = redColonySets;
    this.blueColonySets = blueColonySets;
    this.gridSize = gridSize;
  }

  static newGameState(): GameState {
    return new GameState({
      gamePhase: GamePhase.RED_TURN,
      movesLeft: 3,
      gridSize: 10,
      redVirusCellCodes: [],
      blueVirusCellCodes: [],
      redColonySets: [],
      blueColonySets: [],
    });
  }

  static fromSerializedGameState(serializedGameState: IGameState): GameState {
    return new GameState({
      gamePhase: serializedGameState.gamePhase,
      movesLeft: serializedGameState.movesLeft,
      redVirusCellCodes: serializedGameState.redVirusCellCodes,
      blueVirusCellCodes: serializedGameState.blueVirusCellCodes,
      redColonySets: serializedGameState.redColonySets,
      blueColonySets: serializedGameState.blueColonySets,
      gridSize: serializedGameState.gridSize,
    });
  }

  private _calculateAvailableCellCodes(): CellCode[] {
    const virusContainer =
      this.gamePhase === GamePhase.RED_TURN ? this.redVirusCellCodes : this.blueVirusCellCodes;

    const colonyContainer =
      this.gamePhase === GamePhase.RED_TURN ? this.redColonySets : this.blueColonySets;
    const enemyVirusType =
      this.gamePhase === GamePhase.RED_TURN ? CellType.BLUE_VIRUS : CellType.RED_VIRUS;

    const result: Set<string> = new Set();

    // Check virus cells
    if (!virusContainer.length) {
      if (this.gamePhase === GamePhase.RED_TURN) {
        result.add('0-0');
      } else {
        result.add(`${this.gridSize - 1}-${this.gridSize - 1}`);
      }

      return Array.from(result);
    }

    virusContainer.forEach((virusCellCode: string) => {
      const adjacentVirusCellCodes = this._getAdjacentCellCodes(virusCellCode);
      adjacentVirusCellCodes.forEach((cellCode: string) => {
        const cellType = this._getCellType(cellCode);
        if (!cellType || cellType === enemyVirusType) {
          result.add(cellCode);
        }
      });
    });

    // Check colony cells
    colonyContainer
      .filter((colonySet: IColonySet) => colonySet.activated)
      .forEach((colonySet: IColonySet) => {
        colonySet.colonyCellsCodes.forEach((cellCode: string) => {
          const adjacentColonyCellCodes = this._getAdjacentCellCodes(cellCode);
          adjacentColonyCellCodes.forEach((cellCode: string) => {
            const cellType = this._getCellType(cellCode);
            if (!cellType || cellType === enemyVirusType) {
              result.add(cellCode);
            }
          });
        });
      });

    return Array.from(result);
  }

  /**
   * Gets all 8 adjacent cell codes (including diagonals) without filtering
   * Returns all adjacent cells regardless of their content (virus, colony, or empty)
   */
  private _getAdjacentCellCodes(cellCode: CellCode): CellCode[] {
    const [rowStr, colStr] = cellCode.split('-');
    const row = parseInt(rowStr);
    const col = parseInt(colStr);
    const adjacent: string[] = [];

    // Check all 8 directions (including diagonals)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue; // Skip the cell itself

        const newRow = row + dr;
        const newCol = col + dc;

        // Check bounds
        if (newRow >= 0 && newRow < this.gridSize && newCol >= 0 && newCol < this.gridSize) {
          adjacent.push(`${newRow}-${newCol}`);
        }
      }
    }

    return adjacent;
  }

  _getCellType(cellCode: CellCode): CellType | null {
    if (this.redVirusCellCodes.includes(cellCode)) {
      return CellType.RED_VIRUS;
    } else if (this.blueVirusCellCodes.includes(cellCode)) {
      return CellType.BLUE_VIRUS;
    }

    const redColonySet = this.redColonySets.find((colSet: ColonySet) =>
      colSet.colonyCellsCodes.has(cellCode)
    );
    if (redColonySet) {
      return redColonySet.activated ? CellType.RED_COLONY_ACTIVE : CellType.RED_COLONY_INACTIVE;
    }

    const blueColonySet = this.blueColonySets.find((colSet: ColonySet) =>
      colSet.colonyCellsCodes.has(cellCode)
    );
    if (blueColonySet) {
      return blueColonySet.activated ? CellType.BLUE_COLONY_ACTIVE : CellType.BLUE_COLONY_INACTIVE;
    }

    return null;
  }
}
