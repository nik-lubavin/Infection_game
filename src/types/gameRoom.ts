/** Client view of a server room (see server GameRoom / ROOMS_LISTED payload). */
export interface GameRoom {
  id: string;
  status: string;
  players: {
    red: string | null;
    blue: string | null;
  };
  gameState: unknown;
  createdAt: number;
  hostName: string;
}
