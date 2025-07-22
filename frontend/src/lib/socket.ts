import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(userId?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    console.log('Connecting to WebSocket server...');

    this.socket = io(SOCKET_URL, {
      auth: {
        token: userId || 'anonymous'
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to WebSocket server after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting from WebSocket server...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  emit(event: string, data?: unknown) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  on(event: string, listener: (...args: unknown[]) => void) {
    if (this.socket) {
      this.socket.on(event, listener);
    }
  }

  off(event: string, listener?: (...args: unknown[]) => void) {
    if (this.socket) {
      this.socket.off(event, listener);
    }
  }
}

// Singleton instance
const socketManager = new SocketManager();

export default socketManager; 