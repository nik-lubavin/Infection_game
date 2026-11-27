import type { IGameState, IRoomSummary, RoomPlayerSide } from '@infection-game/shared';

export interface SessionState {
  roomList: IRoomSummary[];
  /** Room the player is in, as the server reports it; null in the lobby. */
  yourRoomId: string | null;
  /** Summary of the player's room; null in the lobby. */
  room: IRoomSummary | null;
  yourSide: RoomPlayerSide | null;
  game: IGameState | null;
}

export const initialSessionState: SessionState = {
  roomList: [],
  yourRoomId: null,
  room: null,
  yourSide: null,
  game: null,
};

export type SessionAction =
  | { type: 'roomListReceived'; roomList: IRoomSummary[]; yourRoomId: string | null }
  | { type: 'roomCreated'; room: IRoomSummary; yourSide: RoomPlayerSide }
  | { type: 'roomLeft' }
  | { type: 'opponentLeft'; room: IRoomSummary | null }
  | { type: 'roomSessionReceived'; room: IRoomSummary; state: IGameState; yourSide: RoomPlayerSide }
  | { type: 'gameStateReceived'; state: IGameState };

/** The player is in no room. */
function inLobby(state: SessionState): SessionState {
  return { ...state, yourRoomId: null, room: null, yourSide: null, game: null };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'roomListReceived': {
      const { roomList, yourRoomId } = action;
      if (yourRoomId === null) return inLobby({ ...state, roomList });

      const room = roomList.find((r) => r.id === yourRoomId) ?? null;
      if (yourRoomId === state.room?.id) {
        return { ...state, roomList, yourRoomId, room };
      }
      // A room this client has not seen yet: the side and the game come with their own events.
      return { ...state, roomList, yourRoomId, room, game: null };
    }
    case 'roomCreated':
      return {
        ...state,
        yourRoomId: action.room.id,
        room: action.room,
        yourSide: action.yourSide,
        game: null,
      };
    case 'roomLeft':
      return inLobby(state);
    case 'opponentLeft':
      // The host stays and waits for a new guest; a guest whose host left is back in the lobby.
      if (action.room === null) return inLobby(state);
      return { ...state, room: action.room, game: null };
    case 'roomSessionReceived':
      return {
        ...state,
        yourRoomId: action.room.id,
        room: action.room,
        yourSide: action.yourSide,
        game: action.state,
      };
    case 'gameStateReceived':
      return { ...state, game: action.state };
  }
}
