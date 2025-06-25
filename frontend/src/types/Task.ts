export interface Task {
  _id?: string;
  title: string;
  completed: boolean;
  priority?: string;
  category?: string;
  dueDate?: string;
  subtasks: Subtask[]
}

export interface Subtask {
  title: string;
  completed: boolean
}
