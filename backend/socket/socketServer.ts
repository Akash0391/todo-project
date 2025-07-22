import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { taskHandlers } from './handlers/taskHandlers';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        // Allow connection without auth for now, but mark as anonymous
        socket.userId = 'anonymous';
        socket.user = null;
        return next();
      }

      // If you have JWT authentication, uncomment and modify this:
      // const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      // socket.userId = decoded.userId;
      // socket.user = decoded;

      // For now, accept any connection
      socket.userId = token || 'anonymous';
      socket.user = { id: socket.userId };
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handling
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Register task event handlers
    taskHandlers(socket, io);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.userId} disconnected: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

export default initializeSocket;
