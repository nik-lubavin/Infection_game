import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { SERVER_EVENTS, type IGameState, type StateUpdatePayload } from '@infection-game/shared';

export function useGameState(socket: Socket | null) {
  const [stateGame, setStateGame] = useState<IGameState | null>(null);

  useEffect(() => {
    if (!socket) return;
    const onStateUpdate = (payload: StateUpdatePayload) => setStateGame(payload.state);
    socket.on(SERVER_EVENTS.STATE_UPDATE, onStateUpdate);
    return () => {
      socket.off(SERVER_EVENTS.STATE_UPDATE, onStateUpdate);
    };
  }, [socket]);

  return {
    stateGame,
    setStateGame,
  };
}
