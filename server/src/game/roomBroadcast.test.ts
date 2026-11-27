import assert from 'node:assert/strict';
import { after, afterEach, before, describe, it, mock } from 'node:test';
import type { IGameRoom } from '@infection-game/shared';
import { roomListFor, roomSessionFor, toRoomSummary } from './roomBroadcast.js';
import { roomService } from './services/roomService.js';

// roomBroadcast reads the shared roomService; every test removes the rooms it created.
const created: IGameRoom[] = [];

function createRoom(hostPlayerId: string, createdAt: number): IGameRoom {
  const result = roomService.createGameRoomInstance({
    hostPlayerId,
    hostName: `${hostPlayerId}-name`,
  });
  assert.ok(result.success);
  result.data.createdAt = createdAt;
  created.push(result.data);
  return result.data;
}

describe('roomBroadcast', () => {
  before(() => mock.method(console, 'log', () => {}));
  after(() => mock.restoreAll());
  afterEach(() => {
    for (const room of created.splice(0)) roomService.removePlayer(room.id, room.hostPlayerId);
  });

  describe('toRoomSummary', () => {
    it('keeps only the public fields and hides player ids and state', () => {
      const room = createRoom('host', 1);
      assert.deepEqual(toRoomSummary(room), {
        id: room.id,
        status: 'waiting',
        hostName: 'host-name',
        hasGuest: false,
      });
    });

    it('reports a guest without naming them', () => {
      const room = createRoom('host', 1);
      roomService.playerJoinRoom(room.id, 'guest');
      const summary = toRoomSummary(room);
      assert.equal(summary.hasGuest, true);
      assert.ok(!JSON.stringify(summary).includes('guest'), 'summary leaks the guest id');
      assert.ok(!JSON.stringify(summary).includes('"host"'), 'summary leaks the host id');
    });
  });

  describe('roomListFor', () => {
    it('lists rooms newest first', () => {
      const old = createRoom('old-host', 100);
      const fresh = createRoom('fresh-host', 200);
      const ids = roomListFor('nobody').data.map((r) => r.id);
      assert.deepEqual(ids, [fresh.id, old.id]);
    });

    it('names the room of the host and of the guest, null for others', () => {
      const room = createRoom('host', 1);
      roomService.playerJoinRoom(room.id, 'guest');
      assert.equal(roomListFor('host').yourRoomId, room.id);
      assert.equal(roomListFor('guest').yourRoomId, room.id);
      assert.equal(roomListFor('nobody').yourRoomId, null);
    });
  });

  describe('roomSessionFor', () => {
    it('gives the host red and the guest blue with the same summary and state', () => {
      const room = createRoom('host', 1);
      roomService.playerJoinRoom(room.id, 'guest');
      roomService.startGame(room.id);

      const host = roomSessionFor(room, 'host');
      const guest = roomSessionFor(room, 'guest');
      assert.equal(host?.yourSide, 'red');
      assert.equal(guest?.yourSide, 'blue');
      assert.deepEqual(host?.room, toRoomSummary(room));
      assert.equal(guest?.state, room.state);
    });

    it('returns null for a player outside the room', () => {
      const room = createRoom('host', 1);
      assert.equal(roomSessionFor(room, 'nobody'), null);
    });
  });
});
