import assert from 'node:assert/strict';
import { after, before, describe, it, mock } from 'node:test';
import { GamePhase, createInitialState, type IGameRoom } from '@infection-game/shared';
import { RoomService, type ServiceResult } from './roomService.js';

const HOST = 'host-id';
const GUEST = 'guest-id';
const OTHER = 'other-id';

function ok<T>(result: ServiceResult<T>): T {
  assert.ok(result.success, `expected success, got ${JSON.stringify(result)}`);
  return result.data;
}

function refused<T>(result: ServiceResult<T>): string {
  assert.ok(!result.success, `expected refusal, got ${JSON.stringify(result)}`);
  return result.reason;
}

function createRoom(service: RoomService, hostPlayerId = HOST): IGameRoom {
  return ok(service.createGameRoomInstance({ hostPlayerId, hostName: `${hostPlayerId}-name` }));
}

/** A room with both players and a started game. */
function playingRoom(service: RoomService): IGameRoom {
  const room = createRoom(service);
  ok(service.playerJoinRoom(room.id, GUEST));
  return ok(service.startGame(room.id));
}

describe('RoomService', () => {
  // The service logs every create/leave; keep the test output readable.
  before(() => mock.method(console, 'log', () => {}));
  after(() => mock.restoreAll());

  describe('createGameRoomInstance', () => {
    it('gives 1000 rooms 1000 distinct readable codes', () => {
      const service = new RoomService();
      const codes = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        const room = createRoom(service, `player-${i}`);
        assert.match(room.id, /^[A-HJ-NP-Z2-9]{6}$/);
        codes.add(room.id);
      }
      assert.equal(codes.size, 1000);
      assert.equal(service.listRooms().length, 1000);
    });

    it('creates a waiting room with the host and no guest', () => {
      const service = new RoomService();
      const room = createRoom(service);
      assert.equal(room.status, 'waiting');
      assert.equal(room.hostPlayerId, HOST);
      assert.equal(room.hostName, `${HOST}-name`);
      assert.equal(room.guestPlayerId, null);
      assert.equal(room.state.gamePhase, GamePhase.NOT_STARTED);
      assert.equal(service.getRoom(room.id), room);
    });

    it('refuses a second room to the same host', () => {
      const service = new RoomService();
      createRoom(service);
      const reason = refused(service.createGameRoomInstance({ hostPlayerId: HOST, hostName: 'x' }));
      assert.equal(reason, 'Already in a room');
      assert.equal(service.listRooms().length, 1);
    });

    it('refuses a room to a player who is a guest elsewhere', () => {
      const service = new RoomService();
      const room = createRoom(service);
      ok(service.playerJoinRoom(room.id, GUEST));
      const reason = refused(
        service.createGameRoomInstance({ hostPlayerId: GUEST, hostName: 'x' })
      );
      assert.equal(reason, 'Already in a room');
    });
  });

  describe('findRoomByPlayer', () => {
    it('finds the room by host and by guest, in any status', () => {
      const service = new RoomService();
      const room = playingRoom(service);
      assert.equal(service.findRoomByPlayer(HOST), room);
      assert.equal(service.findRoomByPlayer(GUEST), room);
      assert.equal(service.findRoomByPlayer(OTHER), undefined);
    });
  });

  describe('playerJoinRoom', () => {
    it('makes the player the guest of the room', () => {
      const service = new RoomService();
      const room = createRoom(service);
      const joined = ok(service.playerJoinRoom(room.id, GUEST));
      assert.equal(joined, room);
      assert.equal(room.guestPlayerId, GUEST);
      assert.equal(room.status, 'waiting');
    });

    it('refuses an unknown room', () => {
      const service = new RoomService();
      assert.equal(refused(service.playerJoinRoom('NOROOM', GUEST)), 'Room not found');
    });

    it('refuses the host of the room', () => {
      const service = new RoomService();
      const room = createRoom(service);
      assert.equal(refused(service.playerJoinRoom(room.id, HOST)), 'Already in this room');
    });

    it('refuses the guest of the room joining again', () => {
      const service = new RoomService();
      const room = createRoom(service);
      ok(service.playerJoinRoom(room.id, GUEST));
      assert.equal(refused(service.playerJoinRoom(room.id, GUEST)), 'Already in this room');
    });

    it('refuses a player who is the host of another room', () => {
      const service = new RoomService();
      const room = createRoom(service);
      createRoom(service, OTHER);
      assert.equal(refused(service.playerJoinRoom(room.id, OTHER)), 'Already in another room');
      assert.equal(room.guestPlayerId, null);
    });

    it('refuses a player who is the guest of another room', () => {
      const service = new RoomService();
      const first = createRoom(service);
      const second = createRoom(service, OTHER);
      ok(service.playerJoinRoom(first.id, GUEST));
      assert.equal(refused(service.playerJoinRoom(second.id, GUEST)), 'Already in another room');
      assert.equal(second.guestPlayerId, null);
    });

    it('refuses a third player when the guest seat is taken', () => {
      const service = new RoomService();
      const room = createRoom(service);
      ok(service.playerJoinRoom(room.id, GUEST));
      assert.equal(refused(service.playerJoinRoom(room.id, OTHER)), 'Room is full');
      assert.equal(room.guestPlayerId, GUEST);
    });
  });

  describe('startGame', () => {
    it('starts a waiting room with both players', () => {
      const service = new RoomService();
      const room = playingRoom(service);
      assert.equal(room.status, 'playing');
      assert.equal(room.state.gamePhase, GamePhase.RED_TURN);
    });

    it('refuses an unknown room', () => {
      const service = new RoomService();
      assert.equal(refused(service.startGame('NOROOM')), 'Room not found');
    });

    it('refuses a room that is already playing', () => {
      const service = new RoomService();
      const room = playingRoom(service);
      assert.equal(refused(service.startGame(room.id)), 'Game already started');
    });

    it('refuses a room without a guest', () => {
      const service = new RoomService();
      const room = createRoom(service);
      assert.equal(refused(service.startGame(room.id)), 'Waiting for another player');
      assert.equal(room.status, 'waiting');
      assert.equal(room.state.gamePhase, GamePhase.NOT_STARTED);
    });
  });

  describe('removePlayer', () => {
    it('deletes a waiting room when the host leaves', () => {
      const service = new RoomService();
      const room = createRoom(service);
      const data = ok(service.removePlayer(room.id, HOST));
      assert.deepEqual(data, { room, opponentId: null, roomDeleted: true });
      assert.equal(service.getRoom(room.id), undefined);
      assert.equal(service.findRoomByPlayer(HOST), undefined);
    });

    it('deletes a playing room when the host leaves and names the guest', () => {
      const service = new RoomService();
      const room = playingRoom(service);
      const data = ok(service.removePlayer(room.id, HOST));
      assert.equal(data.room, room);
      assert.equal(data.opponentId, GUEST);
      assert.equal(data.roomDeleted, true);
      assert.equal(service.getRoom(room.id), undefined);
      assert.equal(service.findRoomByPlayer(GUEST), undefined);
    });

    it('returns the room to waiting with a fresh state when the guest leaves', () => {
      const service = new RoomService();
      const room = playingRoom(service);
      const data = ok(service.removePlayer(room.id, GUEST));
      assert.equal(data.room, room);
      assert.equal(data.opponentId, HOST);
      assert.equal(data.roomDeleted, false);
      assert.equal(service.getRoom(room.id), room);
      assert.equal(room.guestPlayerId, null);
      assert.equal(room.status, 'waiting');
      assert.deepEqual(room.state, createInitialState(room.state.gridSize));
      assert.equal(service.findRoomByPlayer(GUEST), undefined);
    });

    it('refuses a player who is not in the room', () => {
      const service = new RoomService();
      const room = playingRoom(service);
      assert.equal(refused(service.removePlayer(room.id, OTHER)), 'You are not in this room');
      assert.equal(room.status, 'playing');
      assert.equal(room.guestPlayerId, GUEST);
    });

    it('refuses an unknown room', () => {
      const service = new RoomService();
      assert.equal(refused(service.removePlayer('NOROOM', HOST)), 'Room not found');
    });

    it('lets a new guest join and start after the guest left', () => {
      const service = new RoomService();
      const room = playingRoom(service);
      ok(service.removePlayer(room.id, GUEST));
      ok(service.playerJoinRoom(room.id, OTHER));
      assert.equal(room.guestPlayerId, OTHER);
      ok(service.startGame(room.id));
      assert.equal(room.status, 'playing');
      assert.equal(room.state.gamePhase, GamePhase.RED_TURN);
    });

    it('lets the old guest create a room of their own after leaving', () => {
      const service = new RoomService();
      const room = playingRoom(service);
      ok(service.removePlayer(room.id, GUEST));
      const own = createRoom(service, GUEST);
      assert.notEqual(own.id, room.id);
    });
  });
});
