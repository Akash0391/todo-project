'use client'

import TaskForm from "@/components/TaskForm"
import TaskList from "@/components/TaskList"

export default function Home() {
  // You can remove refreshSignal since TanStack Query handles this automatically
  
  return (
    <main className="min-h-screen bg-gray-600 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-700 rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-7xl">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-black flex items-center justify-center gap-2">
          To-Do App
        </h1>
        <TaskForm onTaskAdded={() => {}} /> 
        <TaskList />
      </div>
    </main>
  )
}
