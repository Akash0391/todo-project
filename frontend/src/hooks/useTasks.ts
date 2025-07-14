import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api'
import { Task } from '@/types/Task'

interface TaskFilters {
  search?: string
  status?: string
  priority?: string
  category?: string
}

// Query key factory
export const tasksKeys = {
  all: ['tasks'] as const,
  lists: () => [...tasksKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...tasksKeys.lists(), filters] as const,
}

// Custom hooks
export const useTasks = (filters: TaskFilters = {}) => {
  return useQuery({
    queryKey: tasksKeys.list(filters),
    queryFn: () => tasksApi.getTasks(filters),
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      // Invalidate all task queries to refetch
      queryClient.invalidateQueries({ queryKey: tasksKeys.all })
    },
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: tasksApi.updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all })
    },
    // Optional: Optimistic updates
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.all })
      
      const previousTasks = queryClient.getQueriesData({ queryKey: tasksKeys.all })
      
      queryClient.setQueriesData({ queryKey: tasksKeys.all }, (old: Task[] | undefined) => {
        if (!old) return old
        return old.map(task => 
          task._id === id ? { ...task, ...updates } : task
        )
      })
      
      return { previousTasks }
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all })
    },
  })
}