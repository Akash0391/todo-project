"use client";

import { useState } from "react";

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
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!title.trim()) return;

  const filteredSubtasks = subtasks.filter((s) => s.title.trim() !== "");

  const newTask = {
    title,
    priority,
    category,
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    subtasks: filteredSubtasks,
  };

  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask),
  });

  // Clear form
  setTitle("");
  setPriority("Medium");
  setCategory("General");
  setDueDate("");
  setSubtasks([{ title: "", completed: false }]);

  onTaskAdded();
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
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
        {/* an input container for adding the tasks */}
        <input
          type="text"
          placeholder="Add a task...."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 border text-gray-500 border-gray-300 rounded px-3 py-2"
          required
        />

        <div>
          {/* priorities to be selected */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-black"
          >
            <option value="High">🔴 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>

          {/* categories to be selected */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 px-3 py-2 ml-2 rounded text-black"
          >
            <option value="General">General</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Urgent">Urgent</option>
          </select>

          {/* date for completing the task */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border border-gray-300 text-black w--3xl px-2 py-2 rounded ml-2"
          />
        </div>

        <div>
          <label className="font-medium text-gray-700">Subtasks:</label>
          {subtasks.map((subtask, index) => (
            <div key={index} className="flex gap-2 mt-1">
              <input
                type="text"
                value={subtask.title}
                onChange={(e) => handleSubtaskChange(index, e.target.value)}
                placeholder={`Subtask ${index+1}`}
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-black"
              />
              <button
              type="button" 
              onClick={() => removeSubtaskField(index)}
              className="bg-red-500 text-white px-2 rounded"
              >
                x
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSubtaskField}
            className="mt-2 text-sm text-blue-600"
          >
            + Add Subtask
          </button>
        </div>

        {/* add task button */}
        <button
          type="submit"
          className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Task
        </button>
      </form>
    </>
  );
}
