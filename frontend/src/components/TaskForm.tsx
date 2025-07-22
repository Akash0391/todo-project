"use client";

import { useState } from "react";
import { useCreateTask } from '@/hooks/useTasks'

interface SubTask {
  title: string;
  completed: boolean;
}
interface TaskFormProps {
  onTaskAdded: () => void;
}

export default function TaskForm({ onTaskAdded }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [subtasks, setSubtasks] = useState<SubTask[]>([{title: "", completed: false}]);


  //handle the form submission
  const createTaskMutation = useCreateTask()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!title.trim()) return;

  const filteredSubtasks = subtasks.filter((s) => s.title.trim() !== "");

  const newTask = {
    title,
    priority,
    category,
    dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    subtasks: filteredSubtasks,
    completed: false,
  };

  try {
    await createTaskMutation.mutateAsync(newTask)
    
    // Clear form
    setTitle("");
    setPriority("Medium");
    setCategory("General");
    setDueDate("");
    setSubtasks([{ title: "", completed: false }]);
    
    onTaskAdded();
  } catch (error) {
    console.error('Failed to create task:', error)
  }
};


  const handleSubtaskChange = (index: number, value: string) => {
    const updated = [...subtasks];
    updated[index].title = value;
    setSubtasks(updated);
  }

  const addSubtaskField = () => {
    setSubtasks([...subtasks, {title: "", completed: false}]);
  }

  const removeSubtaskField = (index: number) => {
    const updated = [...subtasks];
    updated.splice(index, 1)
    setSubtasks(updated)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        {/* Task title input */}
        <input
          type="text"
          placeholder="Add a task...."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border text-gray-500 border-gray-300 rounded px-3 py-2"
          required
        />

        {/* Controls row - responsive layout */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          {/* Priority selection */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-black"
          >
            <option value="High">🔴 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>

          {/* Category selection */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 border border-gray-300 px-3 py-2 rounded text-black"
          >
            <option value="General">General</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Urgent">Urgent</option>
          </select>

          {/* Due date input */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 border border-gray-300 text-black px-3 py-2 rounded"
          />
        </div>

        {/* Subtasks section */}
        <div className="border-t pt-4">
          <label className="block font-medium text-gray-700 mb-2">Subtasks:</label>
          <div className="space-y-2">
            {subtasks.map((subtask, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={subtask.title}
                  onChange={(e) => handleSubtaskChange(index, e.target.value)}
                  placeholder={`Subtask ${index+1}`}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-black"
                />
                                 <button
                type="button" 
                onClick={() => removeSubtaskField(index)}
                className="task-action-btn bg-red-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded hover:bg-red-600 transition-colors min-h-[32px] min-w-[32px] text-sm"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSubtaskField}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              + Add Subtask
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full sm:w-auto bg-blue-600 cursor-pointer text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={createTaskMutation.isPending}
        >
          {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
        </button>
      </form>
    </>
  );
}
