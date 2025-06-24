"use client";

import { useState } from "react";

interface TaskFormProps {
  onTaskAdded: () => void;
}

export default function TaskForm({ onTaskAdded }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  //handle the form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, priority, category, dueDate: dueDate ? new Date(dueDate).toISOString() : null }),
    });

    setTitle("");
    setPriority("Medium");
    setCategory("General")
    onTaskAdded(); // trigger parent to refresh task list
  };

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
      />

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
        className="border border-gray-300 px-2 py-1 rounded text-black"
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
        className="border text-black w--3xl px-2 py-2 rounded"
      />

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
