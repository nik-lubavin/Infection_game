import React, { createContext, useContext, type ReactNode } from 'react';
import { useSocketEvents } from '../hooks/useSocketEvents';

type SocketContextValue = ReturnType<typeof useSocketEvents>;

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const value = useSocketEvents();
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (ctx == null) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return ctx;
}
