import React from 'react';
import { act, render, screen } from '@testing-library/react';
import {
  EVENTS,
  createInitialState,
  startGame,
  type IRoomSummary,
  type RoomSessionPayload,
} from '@infection-game/shared';
import App from './App';

type Handler = (payload: unknown) => void;

// Handlers registered on the fake socket, so a test can play a server event.
const mockHandlers = new Map<string, Handler[]>();
const mockIo = jest.fn();

jest.mock('socket.io-client', () => ({
  io: (...args: unknown[]) => {
    mockIo(...args);
    return {
      connected: false,
      id: undefined,
      on: (event: string, handler: Handler) => {
        mockHandlers.set(event, [...(mockHandlers.get(event) ?? []), handler]);
      },
      off: (event: string, handler: Handler) => {
        mockHandlers.set(
          event,
          (mockHandlers.get(event) ?? []).filter((h) => h !== handler)
        );
      },
      emit: jest.fn(),
      disconnect: jest.fn(),
    };
  },
}));

function serverEmits(event: string, payload: unknown) {
  act(() => {
    (mockHandlers.get(event) ?? []).forEach((handler) => handler(payload));
  });
}

beforeEach(() => {
  mockHandlers.clear();
  mockIo.mockClear();
});

test('renders the game title', () => {
  render(<App />);
  expect(screen.getByText('Virus Infection Game')).toBeInTheDocument();
});

test('shows a server refusal as a popup message', async () => {
  render(<App />);
  serverEmits(EVENTS.JOIN_ROOM_FAILED, { reason: 'Room is full' });
  expect(await screen.findByText('Room is full')).toBeInTheDocument();
});

test('sends the player identity in the handshake auth', () => {
  render(<App />);
  expect(mockIo).toHaveBeenCalledWith(expect.any(String), {
    auth: {
      playerId: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      ),
      name: expect.stringMatching(/^[A-Z]{3}\d$/),
    },
  });
});

const waitingRoom: IRoomSummary = {
  id: 'ABC234',
  status: 'waiting',
  hostName: 'HST1',
  hasGuest: false,
};
const playingRoom: IRoomSummary = { ...waitingRoom, status: 'playing', hasGuest: true };

function session(yourSide: 'red' | 'blue'): RoomSessionPayload {
  return { room: playingRoom, state: startGame(createInitialState()), yourSide };
}

test('lists rooms pushed by the server with host name and status', () => {
  render(<App />);
  serverEmits('connect', undefined);
  serverEmits(EVENTS.ROOM_LIST_UPDATED, { data: [waitingRoom], yourRoomId: null });
  expect(screen.getByText('ABC234')).toBeInTheDocument();
  expect(screen.getByText('HST1')).toBeInTheDocument();
  expect(screen.getByText('waiting')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Connect to room ABC234' })).toBeInTheDocument();
});

test('the guest sees the board with nothing to click on the red turn', () => {
  render(<App />);
  serverEmits(EVENTS.JOIN_ROOM_RESPONSE, session('blue'));
  expect(screen.getAllByLabelText(/^Cell \d+-\d+$/)).toHaveLength(100);
  expect(screen.getByLabelText('Cell 0-0')).toHaveStyle({ backgroundColor: '#f0f0f0' });
});

test('the host waits in the modal, then sees the board with 0-0 available', () => {
  render(<App />);
  serverEmits(EVENTS.CREATE_ROOM_RESPONSE, { room: waitingRoom, yourSide: 'red' });
  expect(screen.getByText('New game')).toBeInTheDocument();
  expect(screen.queryByLabelText('Cell 0-0')).not.toBeInTheDocument();

  serverEmits(EVENTS.PLAYER_JOINED_ROOM, session('red'));
  expect(screen.queryByText('New game')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Cell 0-0')).toHaveStyle({ backgroundColor: '#ffeeee' });
  expect(screen.getByLabelText('Cell 0-1')).toHaveStyle({ backgroundColor: '#f0f0f0' });
});

test('the guest is back in the lobby when the host closes the room', async () => {
  render(<App />);
  serverEmits(EVENTS.JOIN_ROOM_RESPONSE, session('blue'));
  serverEmits(EVENTS.OPPONENT_LEFT, { roomCode: 'ABC234', room: null });
  expect(await screen.findByText('Opponent left. The room was closed.')).toBeInTheDocument();
  expect(screen.queryByLabelText('Cell 0-0')).not.toBeInTheDocument();
});
