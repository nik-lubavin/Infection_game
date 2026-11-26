import { useEffect, type Dispatch } from 'react';
import type { Socket } from 'socket.io-client';
import { EVENTS, type StateUpdatePayload } from '@infection-game/shared';
import type { SessionAction } from '../session/sessionReducer';

export function useGameState(socket: Socket | null, dispatch: Dispatch<SessionAction>): void {
  useEffect(() => {
    if (!socket) return;
    const onStateUpdate = (payload: StateUpdatePayload) =>
      dispatch({ type: 'gameStateReceived', state: payload.state });
    socket.on(EVENTS.GAME_ACTION_RESPONSE, onStateUpdate);
    return () => {
      socket.off(EVENTS.GAME_ACTION_RESPONSE, onStateUpdate);
    };
  }, [socket, dispatch]);
}
