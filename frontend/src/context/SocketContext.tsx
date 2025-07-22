'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import socketManager from '@/lib/socket';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: (userId?: string) => void;
  disconnect: () => void;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  off: (event: string, listener?: (...args: unknown[]) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  userId?: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, userId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = (connectUserId?: string) => {
    try {
      const newSocket = socketManager.connect(connectUserId || userId);
      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };

  const disconnect = () => {
    socketManager.disconnect();
    setSocket(null);
    setIsConnected(false);
  };

  const emit = (event: string, data?: unknown) => {
    socketManager.emit(event, data);
  };

  const on = (event: string, listener: (...args: unknown[]) => void) => {
    socketManager.on(event, listener);
  };

  const off = (event: string, listener?: (...args: unknown[]) => void) => {
    socketManager.off(event, listener);
  };

  useEffect(() => {
    // Auto-connect when provider mounts
    connect();

    // Set up connection status listener
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketManager.on('connect', handleConnect);
    socketManager.on('disconnect', handleDisconnect);

    // Cleanup on unmount
    return () => {
      socketManager.off('connect', handleConnect);
      socketManager.off('disconnect', handleDisconnect);
      // Don't disconnect here - let the user explicitly disconnect if needed
    };
  }, [userId] );

  // Update socket state when socketManager changes
  useEffect(() => {
    const currentSocket = socketManager.getSocket();
    setSocket(currentSocket);
    setIsConnected(socketManager.isConnected());
  }, []);

  const value: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 