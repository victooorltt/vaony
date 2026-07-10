"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

/** Shared Socket.IO client — auth travels in the httpOnly session cookie. */
let socket: Socket | null = null;

export function useSocket(): Socket {
  const ref = useRef<Socket | null>(null);
  if (!ref.current) {
    if (!socket) {
      socket = io({ path: "/socket.io", withCredentials: true });
    }
    ref.current = socket;
  }

  useEffect(() => {
    const s = ref.current;
    return () => {
      // keep the singleton alive across pages; do not disconnect on unmount
      void s;
    };
  }, []);

  return ref.current;
}
