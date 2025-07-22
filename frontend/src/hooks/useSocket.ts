'use client';

import { useEffect, useCallback } from 'react';
import { useSocket as useSocketContext } from '@/context/SocketContext';
import { useQueryClient } from '@tanstack/react-query';
import { tasksKeys } from './useTasks';
import { Task } from '@/types/Task';

interface SocketEventData {
  task?: Task;
  taskId?: string;
  tasks?: Array<{ id: string; orderIndex: number }>;
  updates?: Partial<Task>;
  userId?: string;
  timestamp?: Date;
}

export const useTaskSocket = () => {
  const { socket, isConnected, on, off } = useSocketContext();
  const queryClient = useQueryClient();

  // Handle task creation events
  const handleTaskCreated = useCallback((data: SocketEventData) => {
    console.log('Task created:', data);
    if (data.task) {
      // Add new task to all relevant queries
      queryClient.setQueriesData({ queryKey: tasksKeys.all }, (oldData: Task[] | undefined) => {
        if (!oldData) return [data.task!];
        return [...oldData, data.task!];
      });
      
      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    }
  }, [queryClient]);

  // Handle task update events
    const handleTaskUpdated = useCallback((data: SocketEventData) => {
    console.log('Task updated:', data);
    if (data.task) {
      // Update task in all relevant queries
      queryClient.setQueriesData({ queryKey: tasksKeys.all }, (oldData: Task[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(task => 
          task._id === data.task!._id ? data.task! : task
        );
      });
      
      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    }
  }, [queryClient]);

  // Handle task deletion events
  const handleTaskDeleted = useCallback((data: SocketEventData) => {
    console.log('Task deleted:', data);
    if (data.taskId) {
      // Remove task from all relevant queries
      queryClient.setQueriesData({ queryKey: tasksKeys.all }, (oldData: Task[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(task => task._id !== data.taskId);
      });
      
      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    }
  }, [queryClient]);

  // Handle task reorder events
  const handleTaskReordered = useCallback((data: SocketEventData) => {
    console.log('Tasks reordered:', data);
    if (data.tasks) {
      // Update task order in all relevant queries
      queryClient.setQueriesData({ queryKey: tasksKeys.all }, (oldData: Task[] | undefined) => {
        if (!oldData) return oldData;
        
        const orderMap = new Map(data.tasks!.map(item => [item.id, item.orderIndex]));
        
        return oldData
          .map(task => ({
            ...task,
            orderIndex: orderMap.get(task._id!) ?? task.orderIndex
          }))
          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      });
      
      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    }
  }, [queryClient]);

  // Handle real-time collaboration events
  const handleTaskCollaboration = useCallback((data: SocketEventData) => {
    console.log('Task collaboration event:', data);
    // You can implement real-time collaboration features here
    // For example, showing who's currently editing a task
  }, []);

  // Handle socket errors
  const handleTaskError = useCallback((data: { message: string }) => {
    console.error('Task socket error:', data.message);
    // You can show toast notifications or handle errors here
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Register event listeners
    on('task:created', handleTaskCreated as (...args: unknown[]) => void);
    on('task:updated', handleTaskUpdated as (...args: unknown[]) => void);
    on('task:deleted', handleTaskDeleted as (...args: unknown[]) => void);
    on('task:reordered', handleTaskReordered as (...args: unknown[]) => void);
    on('task:collaboration', handleTaskCollaboration as (...args: unknown[]) => void);
    on('task:error', handleTaskError as (...args: unknown[]) => void);

    // Cleanup function
    return () => {
      off('task:created', handleTaskCreated as (...args: unknown[]) => void);
      off('task:updated', handleTaskUpdated as (...args: unknown[]) => void);
      off('task:deleted', handleTaskDeleted as (...args: unknown[]) => void);
      off('task:reordered', handleTaskReordered as (...args: unknown[]) => void);
      off('task:collaboration', handleTaskCollaboration as (...args: unknown[]) => void);
      off('task:error', handleTaskError as (...args: unknown[]) => void);
    };
  }, [
    socket,
    isConnected,
    on,
    off,
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
    handleTaskReordered,
    handleTaskCollaboration,
    handleTaskError
  ]);

  return {
    isConnected,
    socket,
  };
};

// Additional hook for task-specific real-time features
export const useTaskRealTime = (taskId?: string) => {
  const { socket, isConnected, emit } = useSocketContext();

  // Join task room for collaboration
  const joinTaskRoom = useCallback(() => {
    if (taskId && socket && isConnected) {
      emit('task:join', taskId);
    }
  }, [taskId, socket, isConnected, emit]);

  // Leave task room
  const leaveTaskRoom = useCallback(() => {
    if (taskId && socket && isConnected) {
      emit('task:leave', taskId);
    }
  }, [taskId, socket, isConnected, emit]);

  // Emit typing indicator
  const setTyping = useCallback((isTyping: boolean) => {
    if (taskId && socket && isConnected) {
      emit('task:typing', { taskId, isTyping });
    }
  }, [taskId, socket, isConnected, emit]);

  // Quick update (for real-time field updates)
    const quickUpdate = useCallback((field: string, value: unknown) => {
    if (taskId && socket && isConnected) {
      emit('task:quick-update', { taskId, field, value });
    }
  }, [taskId, socket, isConnected, emit]);

  // Join room when hook is used
  useEffect(() => {
    joinTaskRoom();
    return () => {
      leaveTaskRoom();
    };
  }, [joinTaskRoom, leaveTaskRoom]);

  return {
    joinTaskRoom,
    leaveTaskRoom,
    setTyping,
    quickUpdate,
    isConnected,
  };
}; 