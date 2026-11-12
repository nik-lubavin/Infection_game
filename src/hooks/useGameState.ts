import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { EVENTS, type IGameState, type StateUpdatePayload } from '@infection-game/shared';

export function useGameState(socket: Socket | null) {
  const [stateGame, setStateGame] = useState<IGameState | null>(null);

  useEffect(() => {
    if (!socket) return;
    const onStateUpdate = (payload: StateUpdatePayload) => setStateGame(payload.state);
    socket.on(EVENTS.GAME_ACTION_RESPONSE, onStateUpdate);
    return () => {
      socket.off(EVENTS.GAME_ACTION_RESPONSE, onStateUpdate);
    };
  }, [socket]);

  return {
    stateGame,
    setStateGame,
  };
}
