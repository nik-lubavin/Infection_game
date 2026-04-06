import { useMemo } from "react";
import { getOrCreateSessionName } from "../utils/playerSession";

export function usePlayerSession(): string {
  return useMemo(() => getOrCreateSessionName(), []);
}
