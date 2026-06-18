import { GamePhase, type IGameState, type CellCode, CellType } from '../types/index.js';
import { ColonySet } from './colonySet.js';

export class GameState {
  public gamePhase: GamePhase;
  public movesLeft: number;
  public redVirusCellCodes: string[];
  public blueVirusCellCodes: string[];
  public redColonySets: ColonySet[];
  public blueColonySets: ColonySet[];
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
    redColonySets: ColonySet[];
    blueColonySets: ColonySet[];
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
      redColonySets: serializedGameState.redColonySets.map(ColonySet.fromIColonySet),
      blueColonySets: serializedGameState.blueColonySets.map(ColonySet.fromIColonySet),
      gridSize: serializedGameState.gridSize,
    });
  }

  toIGameState(): IGameState {
    return {
      gamePhase: this.gamePhase,
      movesLeft: this.movesLeft,
      redVirusCellCodes: this.redVirusCellCodes,
      blueVirusCellCodes: this.blueVirusCellCodes,
      redColonySets: this.redColonySets.map((c) => c.toIColonySet()),
      blueColonySets: this.blueColonySets.map((c) => c.toIColonySet()),
      gridSize: this.gridSize,
    };
  }

  private _calculateAvailableCellCodes(): CellCode[] {
    const virusContainer =
      this.gamePhase === GamePhase.RED_TURN ? this.redVirusCellCodes : this.blueVirusCellCodes;

    const colonyContainer =
      this.gamePhase === GamePhase.RED_TURN ? this.redColonySets : this.blueColonySets;
    const enemyVirusType =
      this.gamePhase === GamePhase.RED_TURN ? CellType.BLUE_VIRUS : CellType.RED_VIRUS;

    const result: Set<string> = new Set();

    if (!virusContainer.length) {
      if (this.gamePhase === GamePhase.RED_TURN) {
        result.add('0-0');
      } else {
        result.add(`${this.gridSize - 1}-${this.gridSize - 1}`);
      }
      return Array.from(result);
    }

    virusContainer.forEach((virusCellCode: string) => {
      this._getAdjacentCellCodes(virusCellCode).forEach((cellCode: string) => {
        const cellType = this._getCellType(cellCode);
        if (!cellType || cellType === enemyVirusType) {
          result.add(cellCode);
        }
      });
    });

    colonyContainer
      .filter((colonySet) => colonySet.activated)
      .forEach((colonySet) => {
        colonySet.colonyCellsCodes.forEach((cellCode: string) => {
          this._getAdjacentCellCodes(cellCode).forEach((adjacentCode: string) => {
            const cellType = this._getCellType(adjacentCode);
            if (!cellType || cellType === enemyVirusType) {
              result.add(adjacentCode);
            }
          });
        });
      });

    return Array.from(result);
  }

  private _getAdjacentCellCodes(cellCode: CellCode): CellCode[] {
    const [rowStr, colStr] = cellCode.split('-');
    const row = parseInt(rowStr);
    const col = parseInt(colStr);
    const adjacent: string[] = [];

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const newRow = row + dr;
        const newCol = col + dc;
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
    }
    if (this.blueVirusCellCodes.includes(cellCode)) {
      return CellType.BLUE_VIRUS;
    }

    const redColonySet = this.redColonySets.find((colSet) => colSet.colonyCellsCodes.has(cellCode));
    if (redColonySet) {
      return redColonySet.activated ? CellType.RED_COLONY_ACTIVE : CellType.RED_COLONY_INACTIVE;
    }

    const blueColonySet = this.blueColonySets.find((colSet) =>
      colSet.colonyCellsCodes.has(cellCode)
    );
    if (blueColonySet) {
      return blueColonySet.activated ? CellType.BLUE_COLONY_ACTIVE : CellType.BLUE_COLONY_INACTIVE;
    }

    return null;
  }
}
