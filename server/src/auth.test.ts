import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseSocketAuth } from './auth.js';

const PLAYER_ID = '11111111-1111-4111-8111-111111111111';

describe('parseSocketAuth', () => {
  it('accepts a UUID player id and a short name', () => {
    assert.deepEqual(parseSocketAuth({ playerId: PLAYER_ID, name: 'ABC1' }), {
      ok: true,
      value: { playerId: PLAYER_ID, name: 'ABC1' },
    });
  });

  it('keeps only playerId and name', () => {
    const result = parseSocketAuth({ playerId: PLAYER_ID, name: 'ABC1', admin: true });
    assert.ok(result.ok);
    assert.deepEqual(Object.keys(result.value).sort(), ['name', 'playerId']);
  });

  it('refuses a missing or non-object auth', () => {
    for (const raw of [undefined, null, 'x', 42, [PLAYER_ID, 'ABC1'], {}]) {
      assert.equal(parseSocketAuth(raw).ok, false, `accepted ${JSON.stringify(raw)}`);
    }
  });

  it('refuses a player id that is not a UUID', () => {
    for (const playerId of [
      '',
      'player-1',
      42,
      `${PLAYER_ID}x`,
      PLAYER_ID.replace('4111', '0111'),
    ]) {
      assert.deepEqual(parseSocketAuth({ playerId, name: 'ABC1' }), {
        ok: false,
        reason: 'Invalid player id',
      });
    }
  });

  it('refuses an empty, too long or non-string name', () => {
    for (const name of ['', 'x'.repeat(33), 42, undefined]) {
      assert.deepEqual(parseSocketAuth({ playerId: PLAYER_ID, name }), {
        ok: false,
        reason: 'Invalid name',
      });
    }
  });
});
