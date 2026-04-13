import React, { createContext, useContext, type ReactNode } from 'react';
import type { GameRoom } from '../types/gameRoom';
import { useRoomList } from '../hooks/useRoomList';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { useSocketEvents } from '../hooks/useSocketEvents';

export type SocketContextValue = {
  socketConnected: boolean;
  connectionError: string | null;
  socketId: string | null;
  currentRoomId: string | null;
  createRoom: () => void;
  disconnectRoom: (roomCode: string) => void;
  roomData: GameRoom[];
  refreshRooms: () => void;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const connection = useSocketConnection();
  const roomActions = useSocketEvents(connection.socket, connection.socketRef);
  const lobby = useRoomList({
    socket: connection.socket,
    socketConnected: connection.socketConnected,
  });

  const value: SocketContextValue = {
    socketConnected: connection.socketConnected,
    connectionError: connection.connectionError,
    socketId: connection.socketId,
    currentRoomId: roomActions.currentRoomId,
    createRoom: roomActions.createRoom,
    disconnectRoom: roomActions.disconnectRoom,
    roomData: lobby.roomList,
    refreshRooms: lobby.refreshRooms,
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
