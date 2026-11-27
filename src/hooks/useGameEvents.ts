import { useEffect, type Dispatch } from 'react';
import type { Socket } from 'socket.io-client';
import { EVENTS, type RoomSessionPayload, type StateUpdatePayload } from '@infection-game/shared';
import type { SessionAction } from '../session/sessionReducer';

/** Game events: the game starts (the guest joins) and the game state changes. */
export function useGameEvents(socket: Socket | null, dispatch: Dispatch<SessionAction>): void {
  useEffect(() => {
    if (!socket) return;

    // The guest gets JOIN_ROOM_RESPONSE, the host PLAYER_JOINED_ROOM; both carry the same data.
    const onRoomSession = (payload: RoomSessionPayload) =>
      dispatch({
        type: 'roomSessionReceived',
        room: payload.room,
        state: payload.state,
        yourSide: payload.yourSide,
      });
    const onStateUpdate = (payload: StateUpdatePayload) =>
      dispatch({ type: 'gameStateReceived', state: payload.state });

    socket.on(EVENTS.JOIN_ROOM_RESPONSE, onRoomSession);
    socket.on(EVENTS.PLAYER_JOINED_ROOM, onRoomSession);
    socket.on(EVENTS.GAME_ACTION_RESPONSE, onStateUpdate);
    return () => {
      socket.off(EVENTS.JOIN_ROOM_RESPONSE, onRoomSession);
      socket.off(EVENTS.PLAYER_JOINED_ROOM, onRoomSession);
      socket.off(EVENTS.GAME_ACTION_RESPONSE, onStateUpdate);
    };
  }, [socket, dispatch]);
}
