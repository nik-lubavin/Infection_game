import type { IGameRoom, IGameState, RoomPlayerSide } from '@infection-game/shared';

export interface SessionState {
  roomList: IGameRoom[];
  /** Room the player is in; null in the lobby. */
  room: IGameRoom | null;
  yourSide: RoomPlayerSide | null;
  game: IGameState | null;
}

export const initialSessionState: SessionState = {
  roomList: [],
  room: null,
  yourSide: null,
  game: null,
};

export type SessionAction =
  | { type: 'roomListReceived'; roomList: IGameRoom[]; playerId: string }
  | { type: 'roomCreated'; room: IGameRoom; yourSide: RoomPlayerSide }
  | { type: 'roomLeft'; roomList: IGameRoom[] }
  | { type: 'gameStateReceived'; state: IGameState };

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'roomListReceived': {
      const room = action.roomList.find(
        (r) => r.hostPlayerId === action.playerId || r.guestPlayerId === action.playerId
      );
      if (room === undefined) {
        return { roomList: action.roomList, room: null, yourSide: null, game: null };
      }
      return { ...state, roomList: action.roomList, room };
    }
    case 'roomCreated':
      return { ...state, room: action.room, yourSide: action.yourSide };
    case 'roomLeft':
      return { roomList: action.roomList, room: null, yourSide: null, game: null };
    case 'gameStateReceived':
      return { ...state, game: action.state };
  }
}
