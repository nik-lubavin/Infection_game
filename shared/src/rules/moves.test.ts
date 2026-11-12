import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CellType,
  GamePhase,
  PlayerType,
  type IColonySet,
  type IGameState,
} from '../types/index.js';
import { getAdjacentCellCodes } from './board.js';
import { getAvailableCellCodes, getCellType } from './cells.js';
import { applyMove, createInitialState, startGame, type MoveResult } from './moves.js';

/** A running game where both sides are past their first action. */
function running(overrides: Partial<IGameState> = {}): IGameState {
  return {
    ...startGame(createInitialState()),
    firstMoveDone: { red: true, blue: true },
    ...overrides,
  };
}

function colony(id: number, owner: PlayerType, cells: string[], activated = true): IColonySet {
  return { id, owner, colonyCellsCodes: cells, activated };
}

function ok(result: MoveResult): IGameState {
  assert.ok(result.ok, `expected ok, got ${JSON.stringify(result)}`);
  return result.state;
}

function rejected(result: MoveResult): string {
  assert.ok(!result.ok, 'expected move to be rejected');
  return result.reason;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

function play(state: IGameState, side: 'red' | 'blue', cells: string[]): IGameState {
  return cells.reduce((s, cell) => ok(applyMove(s, side, cell)), state);
}

describe('createInitialState / startGame', () => {
  it('creates a not-started game', () => {
    const state = createInitialState();
    assert.equal(state.gamePhase, GamePhase.NOT_STARTED);
    assert.equal(state.gridSize, 10);
    assert.equal(state.loser, null);
    assert.deepEqual(state.firstMoveDone, { red: false, blue: false });
  });

  it('rejects unusable grid sizes', () => {
    assert.throws(() => createInitialState(1), RangeError);
    assert.throws(() => createInitialState(2.5), RangeError);
    assert.throws(() => createInitialState(101), RangeError);
  });

  it('starts with red, 3 moves, corner available', () => {
    const state = startGame(createInitialState());
    assert.equal(state.gamePhase, GamePhase.RED_TURN);
    assert.equal(state.movesLeft, 3);
    assert.deepEqual(state.availableCellCodes, ['0-0']);
  });
});

describe('board helpers', () => {
  it('returns neighbours inside the board only', () => {
    assert.deepEqual(getAdjacentCellCodes('0-0', 10).sort(), ['0-1', '1-0', '1-1']);
    assert.equal(getAdjacentCellCodes('5-5', 10).length, 8);
    assert.equal(getAdjacentCellCodes('9-9', 10).length, 3);
    assert.deepEqual(getAdjacentCellCodes('abc', 10), []);
    assert.deepEqual(getAdjacentCellCodes('10-0', 10), []);
  });
});

describe('first action', () => {
  it('is allowed only in own corner, then firstMoveDone is set', () => {
    const start = startGame(createInitialState());
    assert.equal(rejected(applyMove(start, 'red', '1-1')), 'CELL_NOT_AVAILABLE');
    assert.equal(rejected(applyMove(start, 'red', '9-9')), 'CELL_NOT_AVAILABLE');

    const after = ok(applyMove(start, 'red', '0-0'));
    assert.equal(after.firstMoveDone.red, true);
    assert.equal(after.firstMoveDone.blue, false);
    assert.deepEqual(after.redVirusCellCodes, ['0-0']);
    assert.equal(after.movesLeft, 2);
    assert.deepEqual(after.availableCellCodes, ['0-1', '1-0', '1-1']);
  });

  it('blue starts in the opposite corner after red used its 3 actions', () => {
    const afterRed = play(startGame(createInitialState()), 'red', ['0-0', '0-1', '0-2']);
    assert.equal(afterRed.gamePhase, GamePhase.BLUE_TURN);
    assert.deepEqual(afterRed.availableCellCodes, ['9-9']);
    assert.equal(rejected(applyMove(afterRed, 'blue', '8-8')), 'CELL_NOT_AVAILABLE');

    const afterBlue = ok(applyMove(afterRed, 'blue', '9-9'));
    assert.equal(afterBlue.firstMoveDone.blue, true);
    assert.deepEqual(afterBlue.blueVirusCellCodes, ['9-9']);
  });

  it('is not given back to a side whose viruses were all captured', () => {
    const state = running({
      gamePhase: GamePhase.BLUE_TURN,
      redVirusCellCodes: ['0-0'],
      blueVirusCellCodes: [],
    });
    assert.deepEqual(getAvailableCellCodes(state, 'blue'), []);
  });
});

describe('move validation', () => {
  it('rejects a cell that does not touch own cells', () => {
    const state = running({ redVirusCellCodes: ['0-0'] });
    assert.equal(rejected(applyMove(state, 'red', '5-5')), 'CELL_NOT_AVAILABLE');
  });

  it('rejects an own virus as a target', () => {
    const state = running({ redVirusCellCodes: ['0-0', '0-1'] });
    assert.equal(rejected(applyMove(state, 'red', '0-1')), 'CELL_NOT_AVAILABLE');
  });

  it('rejects a move out of turn', () => {
    const state = running({ redVirusCellCodes: ['0-0'], blueVirusCellCodes: ['9-9'] });
    assert.equal(rejected(applyMove(state, 'blue', '8-8')), 'NOT_YOUR_TURN');
  });

  it('rejects moves before start and after the end', () => {
    assert.equal(rejected(applyMove(createInitialState(), 'red', '0-0')), 'GAME_NOT_ACTIVE');
    const over = running({ gamePhase: GamePhase.GAME_OVER, loser: PlayerType.BLUE });
    assert.equal(rejected(applyMove(over, 'red', '0-0')), 'GAME_NOT_ACTIVE');
  });

  it('rejects malformed and out-of-board codes', () => {
    const state = running({ redVirusCellCodes: ['0-0'] });
    for (const code of ['99-99', 'abc', '', '5-5-5', '01-1', '-1-0', '1- 1', '10-0', '0-10']) {
      assert.equal(rejected(applyMove(state, 'red', code)), 'INVALID_CELL', code);
    }
  });

  it('accepts the enum and the wire form of a side', () => {
    const state = running({ redVirusCellCodes: ['0-0'] });
    assert.ok(applyMove(state, PlayerType.RED, '0-1').ok);
    assert.ok(applyMove(state, 'red', '0-1').ok);
  });
});

describe('capturing', () => {
  it('turns an enemy virus into a new colony cell', () => {
    const state = running({ redVirusCellCodes: ['4-4'], blueVirusCellCodes: ['4-5', '9-9'] });
    const next = ok(applyMove(state, 'red', '4-5'));
    assert.deepEqual(next.blueVirusCellCodes, ['9-9']);
    assert.deepEqual(next.redColonySets, [colony(1, PlayerType.RED, ['4-5'])]);
    assert.equal(getCellType(next, '4-5'), CellType.RED_COLONY_ACTIVE);
  });

  it('adds to a single adjacent own colony', () => {
    const state = running({
      redVirusCellCodes: ['3-6'],
      redColonySets: [colony(1, PlayerType.RED, ['4-5'], false)],
      blueVirusCellCodes: ['4-6', '9-9'],
    });
    const next = ok(applyMove(state, 'red', '4-6'));
    assert.equal(next.redColonySets.length, 1);
    assert.deepEqual(next.redColonySets[0].colonyCellsCodes.sort(), ['4-5', '4-6']);
    assert.equal(next.redColonySets[0].activated, true);
  });

  it('merges colonies on both sides of the captured cell into one', () => {
    const state = running({
      redVirusCellCodes: ['5-5'],
      redColonySets: [
        colony(1, PlayerType.RED, ['3-3']),
        colony(2, PlayerType.RED, ['3-5'], false),
      ],
      blueVirusCellCodes: ['3-4', '9-9'],
    });
    const next = ok(applyMove(state, 'red', '3-4'));
    assert.equal(next.redColonySets.length, 1);
    const [merged] = next.redColonySets;
    assert.equal(merged.id, 1);
    assert.equal(merged.activated, true);
    assert.deepEqual(merged.colonyCellsCodes.sort(), ['3-3', '3-4', '3-5']);
  });

  it('deactivates an enemy colony that lost its last adjacent virus', () => {
    const state = running({
      redVirusCellCodes: ['3-3'],
      blueVirusCellCodes: ['4-4', '9-9'],
      blueColonySets: [colony(1, PlayerType.BLUE, ['5-5'])],
    });
    const next = ok(applyMove(state, 'red', '4-4'));
    assert.equal(next.blueColonySets[0].activated, false);
    assert.equal(getCellType(next, '5-5'), CellType.BLUE_COLONY_INACTIVE);
    assert.equal(next.redColonySets[0].id, 2, 'ids are unique across both sides');
  });

  it('keeps an enemy colony active while another virus still touches it', () => {
    const state = running({
      redVirusCellCodes: ['3-3'],
      blueVirusCellCodes: ['4-4', '6-6'],
      blueColonySets: [colony(1, PlayerType.BLUE, ['5-5'])],
    });
    const next = ok(applyMove(state, 'red', '4-4'));
    assert.equal(next.blueColonySets[0].activated, true);
  });

  it('cannot capture colony cells or move onto them', () => {
    const state = running({
      redVirusCellCodes: ['4-4'],
      redColonySets: [colony(1, PlayerType.RED, ['4-3'])],
      blueColonySets: [colony(2, PlayerType.BLUE, ['4-5'], false)],
    });
    assert.equal(rejected(applyMove(state, 'red', '4-5')), 'CELL_NOT_AVAILABLE');
    assert.equal(rejected(applyMove(state, 'red', '4-3')), 'CELL_NOT_AVAILABLE');
  });

  it('gives different games independent colony ids', () => {
    const make = () => running({ redVirusCellCodes: ['4-4'], blueVirusCellCodes: ['4-5', '9-9'] });
    const a = ok(applyMove(make(), 'red', '4-5'));
    const b = ok(applyMove(make(), 'red', '4-5'));
    assert.equal(a.redColonySets[0].id, 1);
    assert.equal(b.redColonySets[0].id, 1);
  });
});

describe('colony activation by a new virus', () => {
  it('wakes up an adjacent own inactive colony', () => {
    const state = running({
      redVirusCellCodes: ['3-3'],
      redColonySets: [colony(1, PlayerType.RED, ['5-5'], false)],
      blueVirusCellCodes: ['9-9'],
    });
    const next = ok(applyMove(state, 'red', '4-4'));
    assert.equal(next.redColonySets[0].activated, true);
  });

  it('active colonies extend the reach of their owner', () => {
    const state = running({
      redVirusCellCodes: [],
      redColonySets: [colony(1, PlayerType.RED, ['5-5'])],
    });
    assert.ok(getAvailableCellCodes(state, 'red').includes('6-6'));
    const inactive = running({ redColonySets: [colony(1, PlayerType.RED, ['5-5'], false)] });
    assert.deepEqual(getAvailableCellCodes(inactive, 'red'), []);
  });
});

describe('turn order', () => {
  it('passes the turn after 3 actions and resets movesLeft', () => {
    const start = running({ redVirusCellCodes: ['0-0'], blueVirusCellCodes: ['9-9'] });
    const one = ok(applyMove(start, 'red', '0-1'));
    const two = ok(applyMove(one, 'red', '0-2'));
    assert.equal(one.movesLeft, 2);
    assert.equal(two.movesLeft, 1);
    assert.equal(two.gamePhase, GamePhase.RED_TURN);

    const three = ok(applyMove(two, 'red', '0-3'));
    assert.equal(three.gamePhase, GamePhase.BLUE_TURN);
    assert.equal(three.movesLeft, 3);
    assert.ok(three.availableCellCodes.includes('8-8'));
    assert.equal(rejected(applyMove(three, 'red', '0-4')), 'NOT_YOUR_TURN');
  });
});

describe('game end', () => {
  it('the side that must move but has no available cells loses', () => {
    const state = running({ movesLeft: 1, redVirusCellCodes: ['0-0'], blueVirusCellCodes: [] });
    const next = ok(applyMove(state, 'red', '0-1'));
    assert.equal(next.gamePhase, GamePhase.GAME_OVER);
    assert.equal(next.loser, PlayerType.BLUE);
    assert.deepEqual(next.availableCellCodes, []);
  });

  it('a side that runs out of cells in the middle of its turn loses', () => {
    const state = running({
      gridSize: 2,
      movesLeft: 3,
      redVirusCellCodes: ['0-0', '0-1', '1-0'],
      blueVirusCellCodes: [],
    });
    const next = ok(applyMove(state, 'red', '1-1'));
    assert.equal(next.gamePhase, GamePhase.GAME_OVER);
    assert.equal(next.loser, PlayerType.RED);
  });

  it('eating the last enemy virus ends the game without handing out the corner', () => {
    const state = running({
      movesLeft: 1,
      redVirusCellCodes: ['4-4'],
      blueVirusCellCodes: ['4-5'],
    });
    const next = ok(applyMove(state, 'red', '4-5'));
    assert.equal(next.gamePhase, GamePhase.GAME_OVER);
    assert.equal(next.loser, PlayerType.BLUE);
  });
});

describe('purity and serialization', () => {
  const scenarios: Array<[string, IGameState, 'red' | 'blue', string]> = [
    ['empty cell', running({ redVirusCellCodes: ['0-0'] }), 'red', '0-1'],
    [
      'capture with new colony',
      running({ redVirusCellCodes: ['4-4'], blueVirusCellCodes: ['4-5', '9-9'] }),
      'red',
      '4-5',
    ],
    [
      'merge and deactivate',
      running({
        redVirusCellCodes: ['5-5'],
        redColonySets: [colony(1, PlayerType.RED, ['3-3']), colony(2, PlayerType.RED, ['3-5'])],
        blueVirusCellCodes: ['3-4', '9-9'],
        blueColonySets: [colony(3, PlayerType.BLUE, ['2-4'])],
      }),
      'red',
      '3-4',
    ],
    [
      'turn change',
      running({ movesLeft: 1, redVirusCellCodes: ['0-0'], blueVirusCellCodes: ['9-9'] }),
      'red',
      '0-1',
    ],
  ];

  for (const [name, input, side, cell] of scenarios) {
    it(`does not mutate the input and survives JSON: ${name}`, () => {
      const snapshot = JSON.parse(JSON.stringify(input));
      const frozen = deepFreeze(JSON.parse(JSON.stringify(input)) as IGameState);

      const next = ok(applyMove(frozen, side, cell));

      assert.deepEqual(frozen, snapshot);
      assert.deepEqual(next, JSON.parse(JSON.stringify(next)));
      assert.notEqual(next.redColonySets, frozen.redColonySets);
    });
  }

  it('startGame does not mutate its input either', () => {
    const frozen = deepFreeze(createInitialState());
    const started = startGame(frozen);
    assert.equal(frozen.gamePhase, GamePhase.NOT_STARTED);
    assert.equal(started.gamePhase, GamePhase.RED_TURN);
  });
});
