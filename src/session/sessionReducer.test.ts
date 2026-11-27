import { createInitialState, startGame, type IRoomSummary } from '@infection-game/shared';
import {
  initialSessionState,
  sessionReducer,
  type SessionAction,
  type SessionState,
} from './sessionReducer';

function makeRoom(overrides: Partial<IRoomSummary> = {}): IRoomSummary {
  return { id: 'ABC234', status: 'waiting', hostName: 'Other', hasGuest: false, ...overrides };
}

/** A player sitting in `room` with a running game. */
function inGame(room: IRoomSummary, yourSide: 'red' | 'blue' = 'red'): SessionState {
  return {
    roomList: [room],
    yourRoomId: room.id,
    room,
    yourSide,
    game: startGame(createInitialState()),
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
    it('stores the list and clears the room when the player is in none', () => {
      const before = inGame(makeRoom({ id: 'MINE22' }));
      const otherRoom = makeRoom({ id: 'OTHER2' });

      const next = sessionReducer(before, {
        type: 'roomListReceived',
        roomList: [otherRoom],
        yourRoomId: null,
      });

      expect(next).toEqual({
        roomList: [otherRoom],
        yourRoomId: null,
        room: null,
        yourSide: null,
        game: null,
      });
    });

    it('refreshes the current room from the list and keeps yourSide and game', () => {
      const before = inGame(makeRoom({ id: 'MINE22', status: 'waiting' }), 'blue');
      const updated = makeRoom({ id: 'MINE22', status: 'playing', hasGuest: true });

      const next = sessionReducer(before, {
        type: 'roomListReceived',
        roomList: [makeRoom({ id: 'OTHER2' }), updated],
        yourRoomId: 'MINE22',
      });

      expect(next.room).toBe(updated);
      expect(next.yourRoomId).toBe('MINE22');
      expect(next.yourSide).toBe('blue');
      expect(next.game).toBe(before.game);
    });

    it('takes a new room from the list, drops the game and keeps yourSide', () => {
      const before = inGame(makeRoom({ id: 'OLD222' }), 'red');
      const fresh = makeRoom({ id: 'NEW222' });

      const next = sessionReducer(before, {
        type: 'roomListReceived',
        roomList: [fresh],
        yourRoomId: 'NEW222',
      });

      expect(next.room).toBe(fresh);
      expect(next.yourRoomId).toBe('NEW222');
      expect(next.yourSide).toBe('red');
      expect(next.game).toBeNull();
    });
  });

  it('roomCreated sets the room, yourRoomId and yourSide', () => {
    const room = makeRoom({ id: 'MINE22' });

    const next = sessionReducer(initialSessionState, {
      type: 'roomCreated',
      room,
      yourSide: 'red',
    });

    expect(next).toEqual({ roomList: [], yourRoomId: 'MINE22', room, yourSide: 'red', game: null });
  });

  it('roomLeft keeps the list and resets everything about the room', () => {
    const room = makeRoom({ id: 'MINE22' });
    const before = inGame(room);

    const next = sessionReducer(before, { type: 'roomLeft' });

    expect(next).toEqual({
      roomList: [room],
      yourRoomId: null,
      room: null,
      yourSide: null,
      game: null,
    });
  });

  describe('opponentLeft', () => {
    it('keeps the host in the room with the new summary and no game', () => {
      const before = inGame(makeRoom({ id: 'MINE22', status: 'playing', hasGuest: true }), 'red');
      const waiting = makeRoom({ id: 'MINE22', status: 'waiting', hasGuest: false });

      const next = sessionReducer(before, { type: 'opponentLeft', room: waiting });

      expect(next.room).toBe(waiting);
      expect(next.yourRoomId).toBe('MINE22');
      expect(next.yourSide).toBe('red');
      expect(next.game).toBeNull();
    });

    it('sends the guest back to the lobby when the room was closed', () => {
      const room = makeRoom({ id: 'THEIRS', status: 'playing', hasGuest: true });
      const before = inGame(room, 'blue');

      const next = sessionReducer(before, { type: 'opponentLeft', room: null });

      expect(next).toEqual({
        roomList: [room],
        yourRoomId: null,
        room: null,
        yourSide: null,
        game: null,
      });
    });
  });

  it('roomSessionReceived sets the room, side and game', () => {
    const room = makeRoom({ id: 'THEIRS', status: 'playing', hasGuest: true });
    const state = startGame(createInitialState());

    const next = sessionReducer(initialSessionState, {
      type: 'roomSessionReceived',
      room,
      state,
      yourSide: 'blue',
    });

    expect(next).toEqual({
      roomList: [],
      yourRoomId: 'THEIRS',
      room,
      yourSide: 'blue',
      game: state,
    });
    expect(next.game).toBe(state);
  });

  it('gameStateReceived replaces the game and keeps the rest', () => {
    const before = inGame(makeRoom());
    const game = createInitialState();

    const next = sessionReducer(before, { type: 'gameStateReceived', state: game });

    expect(next).toEqual({ ...before, game });
    expect(next.game).toBe(game);
  });

  it('does not mutate the input state', () => {
    const before: SessionState = deepFreeze(inGame(makeRoom({ id: 'MINE22' })));
    const snapshot = JSON.parse(JSON.stringify(before));
    const actions: SessionAction[] = [
      { type: 'roomListReceived', roomList: [makeRoom()], yourRoomId: null },
      { type: 'roomListReceived', roomList: [makeRoom({ id: 'MINE22' })], yourRoomId: 'MINE22' },
      { type: 'roomListReceived', roomList: [makeRoom({ id: 'NEW222' })], yourRoomId: 'NEW222' },
      { type: 'roomCreated', room: makeRoom({ id: 'NEW234' }), yourSide: 'red' },
      { type: 'roomLeft' },
      { type: 'opponentLeft', room: makeRoom({ id: 'MINE22' }) },
      { type: 'opponentLeft', room: null },
      {
        type: 'roomSessionReceived',
        room: makeRoom({ id: 'NEW222', status: 'playing' }),
        state: createInitialState(),
        yourSide: 'blue',
      },
      { type: 'gameStateReceived', state: createInitialState() },
    ];

    for (const action of actions) {
      expect(sessionReducer(before, action)).not.toBe(before);
    }
    expect(before).toEqual(snapshot);
  });
});
