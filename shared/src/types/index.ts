/** Player slot in room / payloads (lowercase strings on the wire). */
export type RoomPlayerSide = 'red' | 'blue';

export type RoomStatus = 'waiting' | 'playing' | 'finished';

/** Public room view sent to clients. Contains no player identifiers. */
export interface IRoomSummary {
  id: string;
  status: RoomStatus;
  hostName: string;
  /** Whether a second player has joined. */
  hasGuest: boolean;
}

/** Server-internal room. Must not be sent to clients (it holds player ids). */
export interface IGameRoom {
  id: string;
  status: RoomStatus;
  state: IGameState;
  createdAt: number;
  /** Player who created the room. */
  hostPlayerId: string;
  hostName: string;
  /** Player who joined the host; null while the room is waiting. */
  guestPlayerId: string | null;
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
  colonyCellsCodes: string[];
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
  availableCellCodes: string[];
  gridSize: number;
  loser: PlayerType | null;
  /** Whether the side has already made its first action (corner placement). */
  firstMoveDone: { red: boolean; blue: boolean };
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
