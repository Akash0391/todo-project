import { useEffect, useState } from "react";
import { Task } from "../types/Task";

interface TaskListProps {
  refreshSignal?: number;
}

export default function TaskList({ refreshSignal }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const fetchTasks = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`);
    const data = await res.json();
    setTasks(data);
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    fetchTasks();
  };

  const handleEdit = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle }),
    });
    setEditingId(null);
    setEditTitle("");
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshSignal]);

  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const renderTask = (task: Task) => (
    <li key={task._id} className="text-black flex items-center gap-2">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleComplete(task._id!, !task.completed)}
      />
      {editingId === task._id ? (
        <>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <button onClick={() => handleEdit(task._id!)} className="bg-blue-600 px-2 py-0.5 text-white rounded cursor-pointer">Save</button>
          <button onClick={() => setEditingId(null)} className="bg-gray-500 px-2 py-0.5 text-white rounded cursor-pointer">Cancel</button>
        </>
      ) : (
        <>
          <span className={task.completed ? "line-through" : ""}>{task.title}</span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full
              ${task.priority === "High" ? "bg-red-600 text-white" :
                task.priority === "Medium" ? "bg-yellow-300 text-black" :
                "bg-green-600 text-white"}
            `}
          >
            {task.priority}
          </span>
          <div className="flex gap-2 ml-auto">
            <button
            onClick={() => {
              setEditingId(task._id!);
              setEditTitle(task.title);
            }}
            className=" text-white px-2 py-0.5 rounded bg-green-600 cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => deleteTask(task._id!)}
            className="px-2 py-0.5 text-white rounded bg-red-600 cursor-pointer"
          >
            Delete
          </button>
          </div>
        </>
      )}
    </li>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-black font-bold text-lg">Pending Tasks</h3>
        <ul className="space-y-2">
          {incompleteTasks.map(renderTask)}
        </ul>
      </div>

      <div>
        <h3 className="text-black font-bold text-lg">Completed Tasks</h3>
        <ul className="space-y-2 text-gray-500">
          {completedTasks.map(renderTask)}
        </ul>
      </div>
    </div>
  );
}
