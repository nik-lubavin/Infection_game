import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { IGameRoom } from '@infection-game/shared';

import { useRoomEvents } from '../hooks/useRoomEvents';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { useGameState } from '../hooks/useGameState';
import { usePlayerSession } from '../hooks/usePlayerSession';
import { initialSessionState, sessionReducer, type SessionState } from '../session/sessionReducer';

export type SocketContextValue = {
  socketConnected: boolean;
  connectionError: string | null;
  socketId: string | null;
  playerId: string;
  playerName: string;

  session: SessionState;

  actionListRooms: () => void;
  actionCreateRoom: () => void;
  actionJoinRoom: (room: IGameRoom) => void;
  actionLeaveRoom: (roomCode: string) => void;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { name: playerName, playerId } = usePlayerSession();
  const connection = useSocketConnection({ playerId, name: playerName });
  const [session, dispatch] = useReducer(sessionReducer, initialSessionState);

  const { actionListRooms, actionCreateRoom, actionJoinRoom, actionLeaveRoom } = useRoomEvents(
    connection.socket,
    dispatch
  );

  useGameState(connection.socket, dispatch);

  const value: SocketContextValue = {
    socketConnected: connection.socketConnected,
    connectionError: connection.connectionError,
    socketId: connection.socketId,
    playerId,
    playerName,
    session,
    actionListRooms,
    actionCreateRoom,
    actionJoinRoom,
    actionLeaveRoom,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (ctx == null) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return ctx;
}
