import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  SOCKET_URL,
} from "../constants/socketEvents";

export function useRoomsList(): {
  roomCodes: string[];
  socketConnected: boolean;
  refreshRooms: () => void;
  createRoom: () => void;
} {
  const [roomCodes, setRoomCodes] = useState<string[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const refreshRef = useRef<() => void>(() => {});

  const refreshRooms = useCallback(() => {
    socketRef.current?.emit(CLIENT_EVENTS.LIST_ROOMS);
  }, []);

  refreshRef.current = refreshRooms;

  const createRoom = useCallback(() => {
    socketRef.current?.emit(CLIENT_EVENTS.REQUEST_CREATE_ROOM);
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on(SERVER_EVENTS.ROOMS_LISTED, (payload: { roomCodes: string[] }) => {
      setRoomCodes(payload.roomCodes ?? []);
    });
    socket.on(SERVER_EVENTS.ROOM_CREATED, () => {
      refreshRef.current();
    });

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

  return { roomCodes, socketConnected, refreshRooms, createRoom };
}
