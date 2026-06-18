import React, { createContext, useContext, type ReactNode } from 'react';
import type { IGameRoom, IGameState } from '@infection-game/shared';

import { useRoomEvents } from '../hooks/useRoomEvents';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { useGameState } from '../hooks/useGameState';
import { usePlayerSession } from '../hooks/usePlayerSession';

export type SocketContextValue = {
  socketConnected: boolean;
  connectionError: string | null;
  socketId: string | null;
  playerId: string;
  playerName: string;

  stateRoomList: IGameRoom[];
  stateJoinedRoom: IGameRoom | null;
  stateGame: IGameState | null;
  isRoomCreator: boolean;

  actionListRooms: () => void;
  actionCreateRoom: () => void;
  actionJoinRoom: (room: IGameRoom) => void;
  actionLeaveRoom: (roomCode: string) => void;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const connection = useSocketConnection();
  const { name: playerName, playerId } = usePlayerSession();

  const {
    roomList,
    joinedRoom,
    isRoomCreator,
    actionListRooms,
    actionCreateRoom,
    actionJoinRoom,
    actionLeaveRoom,
  } = useRoomEvents(connection.socket);

  const { stateGame } = useGameState(connection.socket);

  const value: SocketContextValue = {
    socketConnected: connection.socketConnected,
    connectionError: connection.connectionError,
    socketId: connection.socketId,
    playerId,
    playerName,
    stateGame,

    isRoomCreator,
    stateRoomList: roomList,
    stateJoinedRoom: joinedRoom,
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
