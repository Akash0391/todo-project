"use client"

import { useState } from "react";
import { Task } from "../types/Task";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd"
  import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/useTasks"

export default function TaskList() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  // Replace manual fetching with TanStack Query
  const { data: tasks = [], isLoading, error } = useTasks({
    search,
    status: statusFilter,
    priority: priorityFilter,
    category: categoryFilter,
  })

  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  // Update your handlers to use mutations:
  const toggleComplete = (id: string, completed: boolean) => {
    updateTaskMutation.mutate({ id, updates: { completed } })
  }

  const deleteTask = (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this task?")
    if (!confirmed) return
    deleteTaskMutation.mutate(id)
  }

  const handleEdit = (id: string) => {
    updateTaskMutation.mutate({ 
      id, 
      updates: { title: editTitle } 
    })
    setEditingId(null)
    setEditTitle("")
  }

  // Add loading and error states in your JSX:
  if (isLoading) return <div className="text-gray-500">Loading tasks...</div>
  if (error) return <div>Error: {error.message}</div>

  // Rest of your component remains the same...

  //handling subtask toggle 
  const handleSubtaskToggle = async (taskId: string, subtaskIndex: number) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return

    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex].completed = !updatedSubtasks[subtaskIndex].completed;

    updateTaskMutation.mutate({ 
      id: taskId, 
      updates: { subtasks: updatedSubtasks } 
    });
  }
  //handling drag order task
  const handleDragEnd = async ( result: DropResult ) => {
    if (!result.destination) return 

    const updatedTasks = Array.from(tasks);
    const [moved] = updatedTasks.splice(result.source.index, 1)
    updatedTasks.splice(result.destination.index, 0, moved)

    const reordered = updatedTasks.map((task, index) => ({...task, orderIndex: index}))

    // Update all tasks with new order indices using TanStack Query
    reordered.forEach((task) => {
      updateTaskMutation.mutate({ 
        id: task._id!, 
        updates: { orderIndex: task.orderIndex } 
      });
    });
  }

  //Rendering the tasks

  const renderTaskWithoutDrag = (task: Task) => (
    <>
  {/* Toggling the checkbox */}
          <li key={task._id} className="text-black flex flex-col sm:flex-row sm:items-center gap-2 p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task._id!, !task.completed)}
                className="flex-shrink-0"
              />
              {/* Edit section */}
              {editingId === task._id ? (
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 border px-2 py-1 rounded"
                  />
                                     <div className="flex gap-1 sm:gap-2">
                     <button onClick={() => handleEdit(task._id!)} className="task-action-btn bg-blue-600 px-2 sm:px-3 py-1 text-white rounded cursor-pointer text-xs sm:text-sm hover:bg-blue-700 transition-colors min-h-[32px] min-w-[50px]">Save</button>
                     <button onClick={() => setEditingId(null)} className="task-action-btn bg-gray-500 px-2 sm:px-3 py-1 text-white rounded cursor-pointer text-xs sm:text-sm hover:bg-gray-600 transition-colors min-h-[32px] min-w-[60px]">Cancel</button>
                   </div>
                </div>
              ) : (
                //Displaying category, priority and duedate
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`${task.completed ? "line-through" : ""} font-medium truncate`}>{task.title}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0
                        ${task.priority === "High" ? "bg-red-600 text-white" :
                          task.priority === "Medium" ? "bg-yellow-300 text-black" :
                          "bg-green-600 text-white"}
                      `}
                    >
                      {task.priority}
                    </span>

                    {task.category && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-200 text-blue-800 flex-shrink-0">
                        {task.category}
                      </span>
                    )}
                  </div>

                  {task.dueDate && (
                    <span className={`inline-block text-black text-sm font-semibold px-2 py-1 rounded-full ${
                      new Date(task.dueDate).toDateString() === new Date().toDateString()
                      ? "bg-yellow-100 text-yellow-800" // today
                      : new Date(task.dueDate) < new Date()
                      ? "bg-red-100 text-red-800" // overdue
                      : "bg-green-100 text-green-800" // upcoming
                    }`}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>

                         {/*Buttons for edit and delete */}
             {editingId !== task._id && (
               <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                 <button
                 onClick={() => {
                   setEditingId(task._id!);
                   setEditTitle(task.title);
                 }}
                 className="task-action-btn text-white px-2 sm:px-3 py-1 rounded bg-green-600 cursor-pointer text-xs sm:text-sm hover:bg-green-700 transition-colors min-h-[32px] min-w-[60px]"
               >
                 Edit
               </button>
               <button
                 onClick={() => deleteTask(task._id!)}
                 className="task-action-btn px-2 sm:px-3 py-1 text-white rounded bg-red-600 cursor-pointer text-xs sm:text-sm hover:bg-red-700 transition-colors min-h-[32px] min-w-[60px]"
               >
                 Delete
               </button>
               </div>
             )}
          </li>
          
          {/* subtask section */}
          {task.subtasks && task.subtasks.length > 0 && (
            <ul className="ml-4 sm:ml-8 mt-2 space-y-1">
              {task.subtasks.map((sub, idx) => (
                <li key={idx} className="text-black flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <input 
                    type="checkbox" 
                    checked={sub.completed}  
                    onChange={() => handleSubtaskToggle(task._id!, idx)}
                    className="flex-shrink-0"
                    />
                  <span className={`${sub.completed ? "line-through" : ""} text-sm`}>
                    {sub.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
    </>
  )
        

  const renderTaskWithDrag = (task: Task, index: number) => (
    <Draggable key={task._id} draggableId={task._id!} index={index}>
      {(provided) => (
        <div 
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        >
          {renderTaskWithoutDrag(task)}
    </div>
  )}
  </Draggable>
);

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Filter Tasks</h3>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-gray-500 border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select 
              className="text-black px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <select 
              className="text-black px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select 
              className="text-black px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="General">General</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task lists Section */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          <div>
            <h3 className="text-black font-bold text-lg mb-3 flex items-center gap-2">
              📝 Pending Tasks
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                {tasks.filter(t => !t.completed).length}
              </span>
            </h3>
            <Droppable droppableId="tasks">
              {(provided) => (
                <ul 
                  className="space-y-3"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {tasks.filter(t => !t.completed).length === 0 ? (
                    <li className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                      No pending tasks. Great job! 🎉
                    </li>
                  ) : (
                    tasks.filter(t => !t.completed).map((task, index) => renderTaskWithDrag(task, index))
                  )}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>

      <div className="space-y-4">
        <h3 className="text-black font-bold text-lg mb-3 flex items-center gap-2">
          ✅ Completed Tasks
          <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
            {tasks.filter(t => t.completed).length}
          </span>
        </h3>
        <ul className="space-y-3">
          {tasks.filter(t => t.completed).length === 0 ? (
            <li className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
              No completed tasks yet.
            </li>
          ) : (
            tasks.filter(t => t.completed).map((task) => (
              <div key={task._id}>
                {renderTaskWithoutDrag(task)}
              </div>
            ))
          )}
        </ul>
      </div>
      
    </div>
  );
}
