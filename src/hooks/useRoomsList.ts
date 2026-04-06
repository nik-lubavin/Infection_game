import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerType } from "../interfaces/Board";
import { io, type Socket } from "socket.io-client";
import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  SOCKET_SERVER_URL,
} from "../constants/socketEvents";

function createSocket(): Socket {
  return io(SOCKET_SERVER_URL);
}

export function useRoomsList(): {
  roomCodes: string[];
  socketConnected: boolean;
  connectionError: string | null;
  refreshRooms: () => void;
  createRoom: () => void;
} {
  const [roomCodes, setRoomCodes] = useState<string[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const refreshRooms = useCallback(() => {
    socketRef.current?.emit(CLIENT_EVENTS.LIST_ROOMS);
  }, []);

  const createRoom = useCallback(() => {
    console.log('creating room');
    socketRef.current?.emit(CLIENT_EVENTS.REQUEST_CREATE_ROOM);
  }, []);

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionError(null);
      setSocketConnected(true);
    });
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("connect_error", (err: Error) => {
      setConnectionError(err.message || "Connection failed");
      setSocketConnected(false);
    });
    socket.on(SERVER_EVENTS.ROOMS_LISTED, (payload: { roomCodes: string[] }) => {
      setRoomCodes(payload.roomCodes ?? []);
    });
    socket.on(
      SERVER_EVENTS.ROOM_CREATED,
      (payload: { roomCode: string; player: PlayerType }) => {
        console.log('room created', {payload});
        const { roomCode } = payload;
        setRoomCodes((prev) =>
          prev.includes(roomCode) ? prev : [...prev, roomCode]
        );
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (socketConnected) {
      refreshRooms();
    }
  }, [socketConnected, refreshRooms]);

  return { roomCodes, socketConnected, connectionError, refreshRooms, createRoom };
}
