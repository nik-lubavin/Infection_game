import { createInitialState, type IGameRoom } from '@infection-game/shared';
import {
  initialSessionState,
  sessionReducer,
  type SessionAction,
  type SessionState,
} from './sessionReducer';

const ME = 'player-me';
const OTHER = 'player-other';

function makeRoom(overrides: Partial<IGameRoom> = {}): IGameRoom {
  return {
    id: 'ABC234',
    status: 'waiting',
    state: createInitialState(),
    createdAt: 1,
    hostPlayerId: OTHER,
    hostName: 'Other',
    guestPlayerId: null,
    ...overrides,
  };
}

/** Deep-freezes the input so any mutation by the reducer throws. */
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
  }
  return value;
}

describe('sessionReducer', () => {
  describe('roomListReceived', () => {
    it('stores the list and finds the room where the player is the host', () => {
      const myRoom = makeRoom({ id: 'MINE22', hostPlayerId: ME });
      const otherRoom = makeRoom({ id: 'OTHER2' });

      const next = sessionReducer(initialSessionState, {
        type: 'roomListReceived',
        roomList: [otherRoom, myRoom],
        playerId: ME,
      });

      expect(next.roomList).toEqual([otherRoom, myRoom]);
      expect(next.room).toBe(myRoom);
    });

    it('finds the room where the player is the guest and keeps yourSide and game', () => {
      const game = createInitialState();
      const before: SessionState = {
        roomList: [],
        room: makeRoom({ guestPlayerId: ME }),
        yourSide: 'blue',
        game,
      };
      const updatedRoom = makeRoom({ guestPlayerId: ME, status: 'playing' });

      const next = sessionReducer(before, {
        type: 'roomListReceived',
        roomList: [updatedRoom],
        playerId: ME,
      });

      expect(next.room).toBe(updatedRoom);
      expect(next.yourSide).toBe('blue');
      expect(next.game).toBe(game);
    });

    it('resets room, yourSide and game when the player has no room in the list', () => {
      const before: SessionState = {
        roomList: [],
        room: makeRoom({ hostPlayerId: ME }),
        yourSide: 'red',
        game: createInitialState(),
      };
      const otherRoom = makeRoom();

      const next = sessionReducer(before, {
        type: 'roomListReceived',
        roomList: [otherRoom],
        playerId: ME,
      });

      expect(next).toEqual({ roomList: [otherRoom], room: null, yourSide: null, game: null });
    });
  });

  it('roomCreated sets room and yourSide from the payload', () => {
    const room = makeRoom({ hostPlayerId: ME });

    const next = sessionReducer(initialSessionState, {
      type: 'roomCreated',
      room,
      yourSide: 'red',
    });

    expect(next.room).toBe(room);
    expect(next.yourSide).toBe('red');
    expect(next.game).toBeNull();
  });

  it('roomLeft stores the new list and resets room, yourSide and game', () => {
    const before: SessionState = {
      roomList: [makeRoom({ hostPlayerId: ME })],
      room: makeRoom({ hostPlayerId: ME }),
      yourSide: 'red',
      game: createInitialState(),
    };
    const remaining = makeRoom({ id: 'OTHER2' });

    const next = sessionReducer(before, { type: 'roomLeft', roomList: [remaining] });

    expect(next).toEqual({ roomList: [remaining], room: null, yourSide: null, game: null });
  });

  it('gameStateReceived replaces the game and keeps the rest', () => {
    const room = makeRoom({ hostPlayerId: ME });
    const before: SessionState = { roomList: [room], room, yourSide: 'red', game: null };
    const game = createInitialState();

    const next = sessionReducer(before, { type: 'gameStateReceived', state: game });

    expect(next).toEqual({ ...before, game });
    expect(next.game).toBe(game);
  });

  it('does not mutate the input state', () => {
    const before: SessionState = deepFreeze({
      roomList: [makeRoom({ hostPlayerId: ME })],
      room: makeRoom({ hostPlayerId: ME }),
      yourSide: 'red',
      game: createInitialState(),
    });
    const snapshot = JSON.parse(JSON.stringify(before));
    const actions: SessionAction[] = [
      { type: 'roomListReceived', roomList: [makeRoom()], playerId: ME },
      { type: 'roomListReceived', roomList: [makeRoom({ hostPlayerId: ME })], playerId: ME },
      { type: 'roomCreated', room: makeRoom({ id: 'NEW234', hostPlayerId: ME }), yourSide: 'red' },
      { type: 'roomLeft', roomList: [] },
      { type: 'gameStateReceived', state: createInitialState() },
    ];

    for (const action of actions) {
      expect(sessionReducer(before, action)).not.toBe(before);
    }
    expect(before).toEqual(snapshot);
  });
});
