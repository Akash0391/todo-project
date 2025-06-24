export interface Task {
  _id?: string;
  title: string;
  completed: boolean;
  priority?: string;
  category?: string;
  dueDate?: string;
}

