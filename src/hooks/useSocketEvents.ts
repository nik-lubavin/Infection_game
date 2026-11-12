// import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
// import type { PlayerType } from '../interfaces/Board';
// import type { Socket } from 'socket.io-client';
// import { EVENTS } from '@infection-game/shared';
// import { getOrCreateSessionName } from '../utils/playerSession';

// export function useSocketEvents(
//   socket: Socket | null,
//   socketRef: RefObject<Socket | null>
// ): {
//   currentRoomId: string | null;
//   // multiplayerGameStarted: boolean;
//   createRoom: () => void;
//   disconnectRoom: (roomCode: string) => void;
// } {
//   // const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
//   // const [multiplayerGameStarted, setMultiplayerGameStarted] = useState(false);
//   // const currentRoomIdRef = useRef<string | null>(null);
//   // currentRoomIdRef.current = currentRoomId;

//   // const createRoom = useCallback(() => {
//   //   socketRef.current?.emit(EVENTS.CREATE_ROOM_REQUEST, {
//   //     userName: getOrCreateSessionName(),
//   //   });
//   // }, []);

//   // const disconnectRoom = useCallback((roomCode: string) => {
//   //   socketRef.current?.emit(EVENTS.LEAVE_ROOM_REQUEST, { roomCode });
//   //   if (currentRoomIdRef.current === roomCode) {
//   //     setMultiplayerGameStarted(false);
//   //   }
//   //   setCurrentRoomId((id) => (id === roomCode ? null : id));
//   // }, []);

//   useEffect(() => {
//     if (!socket) return;

//     // const onRoomCreated = (payload: { roomCode: string; player: PlayerType }) => {
//     //   setMultiplayerGameStarted(false);
//     //   setCurrentRoomId(payload.roomCode);
//     // };
//     // const onGameStart = (payload: {
//     //   roomCode: string;
//     //   serializedState: string;
//     //   yourPlayer: PlayerType;
//     // }) => {
//     //   console.log('game start event', payload);
//     //   setMultiplayerGameStarted(true);
//     //   setCurrentRoomId(payload.roomCode);
//     // };
//     // const onPlayerLeft = (payload: { roomCode: string }) => {
//     //   if (currentRoomIdRef.current === payload.roomCode) {
//     //     setMultiplayerGameStarted(false);
//     //   }
//     //   setCurrentRoomId((id) => (id === payload.roomCode ? null : id));
//     // };

//     // socket.on(EVENTS.CREATE_ROOM_RESPONSE, onRoomCreated);
//     // socket.on(EVENTS.JOIN_ROOM_RESPONSE, onGameStart);
//     // socket.on(EVENTS.LEAVE_ROOM_RESPONSE, onPlayerLeft);

//     return () => {
//       // socket.off(EVENTS.CREATE_ROOM_RESPONSE, onRoomCreated);
//       // socket.off(EVENTS.JOIN_ROOM_RESPONSE, onGameStart);
//       // socket.off(EVENTS.LEAVE_ROOM_RESPONSE, onPlayerLeft);
//     };
//   }, [socket]);

//   // useEffect(() => {
//   //   if (currentRoomId === null) {
//   //     setMultiplayerGameStarted(false);
//   //   }
//   // }, [currentRoomId]);

//   return {
//     // currentRoomId,
//     // multiplayerGameStarted,
//     // createRoom,
//     // disconnectRoom,
//   };
// }
