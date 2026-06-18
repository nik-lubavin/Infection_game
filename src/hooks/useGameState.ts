import { IGameState } from '@infection-game/shared';
import { useState } from 'react';
import type { Socket } from 'socket.io-client';

import { SERVER_EVENTS } from '@infection-game/shared';
import { GameState } from '@infection-game/shared';

export function useGameState(socket: Socket | null) {
  const [stateGame, setStateGame] = useState<GameState | null>(null);

  socket?.on(SERVER_EVENTS.GAME_STATE_UPDATE, (payload: { data: IGameState }) => {
    setStateGame(GameState.fromSerializedGameState(payload.data));
  });

  return {
    stateGame,
    setStateGame,
  };
}
