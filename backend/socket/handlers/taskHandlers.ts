import { Server as SocketServer, Socket } from 'socket.io';
import { Task } from '../../models/Task';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export const taskHandlers = (socket: AuthenticatedSocket, io: SocketServer) => {
  
  // Join task-specific rooms for collaboration
  socket.on('task:join', (taskId: string) => {
    socket.join(`task:${taskId}`);
    console.log(`User ${socket.userId} joined task room: ${taskId}`);
  });

  socket.on('task:leave', (taskId: string) => {
    socket.leave(`task:${taskId}`);
    console.log(`User ${socket.userId} left task room: ${taskId}`);
  });

  // Real-time task updates (for collaborative editing)
  socket.on('task:typing', (data: { taskId: string; isTyping: boolean }) => {
    socket.to(`task:${data.taskId}`).emit('task:user-typing', {
      userId: socket.userId,
      taskId: data.taskId,
      isTyping: data.isTyping
    });
  });

  // Handle real-time task status updates
  socket.on('task:quick-update', async (data: { taskId: string; field: string; value: any }) => {
    try {
      const { taskId, field, value } = data;
      
      // Validate allowed fields for quick updates
      const allowedFields = ['completed', 'priority', 'title'];
      if (!allowedFields.includes(field)) {
        socket.emit('task:error', { message: 'Invalid field for quick update' });
        return;
      }

      // Update task in database
      const updatedTask = await Task.findByIdAndUpdate(
        taskId, 
        { [field]: value }, 
        { new: true }
      );

      if (!updatedTask) {
        socket.emit('task:error', { message: 'Task not found' });
        return;
      }

      // Emit to all users (you might want to restrict this to specific users/rooms)
      io.emit('task:updated', {
        task: updatedTask,
        updatedBy: socket.userId,
        field,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error in quick task update:', error);
      socket.emit('task:error', { message: 'Failed to update task' });
    }
  });

  // Handle task collaboration events
  socket.on('task:collaborate', (data: { taskId: string; action: string; data: any }) => {
    // Broadcast collaboration events to other users in the same task room
    socket.to(`task:${data.taskId}`).emit('task:collaboration', {
      userId: socket.userId,
      taskId: data.taskId,
      action: data.action,
      data: data.data,
      timestamp: new Date()
    });
  });
};

// Helper functions for emitting task events from controllers
export const emitTaskEvent = (io: SocketServer, event: string, data: any) => {
  io.emit(event, {
    ...data,
    timestamp: new Date()
  });
};

export const emitToUser = (io: SocketServer, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, {
    ...data,
    timestamp: new Date()
  });
};

export const emitToTaskRoom = (io: SocketServer, taskId: string, event: string, data: any) => {
  io.to(`task:${taskId}`).emit(event, {
    ...data,
    timestamp: new Date()
  });
}; 