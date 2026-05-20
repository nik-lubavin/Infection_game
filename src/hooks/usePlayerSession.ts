import { useMemo } from 'react';
import { getOrCreatePlayerSession } from '../utils/playerSession';

export function usePlayerSession(): { name: string; playerId: string } {
  return useMemo(() => getOrCreatePlayerSession(), []);
}
