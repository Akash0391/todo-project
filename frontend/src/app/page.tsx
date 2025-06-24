'use client'

import { useState } from "react";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";

export default function Home() {
  const [refreshSignal, setRefreshSignal] = useState(0);

  const handleTaskAdded = () => {
    setRefreshSignal(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gray-600 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-700 rounded-xl shadow-xl p-6 w-dv">
        <h1 className="text-2xl font-bold mb-4 text-black flex items-center justify-center gap-2">To-Do App</h1>
      <TaskForm onTaskAdded={handleTaskAdded} /> {/* ✅ Pass the function */}
      <TaskList refreshSignal={refreshSignal} />
      </div>
      
    </main>
  );
}
