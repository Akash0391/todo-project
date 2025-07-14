import { Task } from '@/types/Task'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

interface TaskFilters {
  search?: string
  status?: string
  priority?: string
  category?: string
}

export const tasksApi = {
  // Get all tasks with filters
  getTasks: async (filters: TaskFilters = {}): Promise<Task[]> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    
    const response = await fetch(`${API_BASE}/tasks?${params}`)
    if (!response.ok) throw new Error('Failed to fetch tasks')
    return response.json()
  },

  // Create new task
  createTask: async (task: Omit<Task, '_id'>): Promise<Task> => {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })
    if (!response.ok) throw new Error('Failed to create task')
    return response.json()
  },

  // Update task
  updateTask: async ({ id, updates }: { id: string; updates: Partial<Task> }): Promise<Task> => {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!response.ok) throw new Error('Failed to update task')
    return response.json()
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete task')
  },
}