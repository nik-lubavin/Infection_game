import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { EVENTS } from '@infection-game/shared';
import App from './App';

type Handler = (payload: unknown) => void;

// Handlers registered on the fake socket, so a test can play a server event.
const mockHandlers = new Map<string, Handler[]>();

jest.mock('socket.io-client', () => ({
  io: () => ({
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
  }),
}));

function serverEmits(event: string, payload: unknown) {
  act(() => {
    (mockHandlers.get(event) ?? []).forEach((handler) => handler(payload));
  });
}

beforeEach(() => mockHandlers.clear());

test('renders the game title', () => {
  render(<App />);
  expect(screen.getByText('Virus Infection Game')).toBeInTheDocument();
});

test('shows a server refusal as a popup message', async () => {
  render(<App />);
  serverEmits(EVENTS.JOIN_ROOM_FAILED, { reason: 'Room is full' });
  expect(await screen.findByText('Room is full')).toBeInTheDocument();
});
