import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    socket.on('scoreUpdate', (data) => {
      console.log('[Socket] Score update received:', data);
      // Could trigger a toast notification or live scoreboard refresh here
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
}
