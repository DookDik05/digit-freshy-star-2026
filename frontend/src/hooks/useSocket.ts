import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useScoringStore } from '../store/scoringStore';

const getBackendUrl = () => {
  if (import.meta.env.PROD) {
    const customUrl = import.meta.env.VITE_BACKEND_URL;
    if (customUrl && !customUrl.includes('localhost')) {
      return customUrl;
    }
    return '';
  }
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
};

const BACKEND_URL = getBackendUrl();

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(BACKEND_URL || undefined, {
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
    });

    socket.on('scoreReset', () => {
      console.log('[Socket] Score reset received');
      useScoringStore.getState().resetScores();
      useScoringStore.setState({ submittedRounds: [] });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
}
