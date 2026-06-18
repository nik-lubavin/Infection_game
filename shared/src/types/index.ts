/** Player slot in room / payloads (lowercase strings on the wire). */
export type RoomPlayerSide = 'red' | 'blue';

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface IGameRoom {
  id: string;
  status: RoomStatus;
  players: {
    red: string | null;
    blue: string | null;
  };
  state: IGameState;
  createdAt: number;
  hostName: string;
}

export enum PlayerType {
  RED = 'red',
  BLUE = 'blue',
}

export enum GamePhase {
  RED_TURN = 'red_turn',
  BLUE_TURN = 'blue_turn',
  GAME_OVER = 'game_over',
  NOT_STARTED = 'not_started',
}

export interface IBoard {
  rows: number;
  cols: number;
}

export interface IColonySet {
  id: number;
  colonyCellsCodes: Set<string>;
  activated: boolean;
  owner: PlayerType;
}

export interface IGameState {
  gamePhase: GamePhase;
  movesLeft: number;
  redVirusCellCodes: string[];
  blueVirusCellCodes: string[];
  redColonySets: IColonySet[];
  blueColonySets: IColonySet[];
  availableCellCodes?: string[];
  gridSize: number;
  loser?: PlayerType | null;
  board?: IBoard;
}

export type CellCode = string;

export enum CellType {
  RED_VIRUS = 'red_virus',
  BLUE_VIRUS = 'blue_virus',
  RED_COLONY_ACTIVE = 'red_colony_active',
  RED_COLONY_INACTIVE = 'red_colony_inactive',
  BLUE_COLONY_ACTIVE = 'blue_colony_active',
  BLUE_COLONY_INACTIVE = 'blue_colony_inactive',
}