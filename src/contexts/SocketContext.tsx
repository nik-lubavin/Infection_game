import React, { createContext, useContext, type ReactNode } from 'react';
import type { IGameRoom, IGameState } from '@infection-game/shared';

import { useRoomEvents } from '../hooks/useRoomEvents';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { useGameState } from '../hooks/useGameState';

export type SocketContextValue = {
  socketConnected: boolean;
  connectionError: string | null;
  socketId: string | null;

  stateRoomList: IGameRoom[];
  stateJoinedRoom: IGameRoom | null;
  stateGame: IGameState | null;

  actionListRooms: () => void;
  actionCreateRoom: () => void;
  actionJoinRoom: (roomCode: string) => void;
  actionLeaveRoom: (roomCode: string) => void;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const connection = useSocketConnection();

  const {
    stateRoomList,
    stateJoinedRoom,
    actionListRooms,
    actionCreateRoom,
    actionJoinRoom,
    actionLeaveRoom,
  } = useRoomEvents(connection.socket, connection.socketConnected);

  const { stateGame } = useGameState(connection.socket);

  const value: SocketContextValue = {
    socketConnected: connection.socketConnected,
    connectionError: connection.connectionError,
    socketId: connection.socketId,
    stateGame,

    stateRoomList,
    stateJoinedRoom,
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
