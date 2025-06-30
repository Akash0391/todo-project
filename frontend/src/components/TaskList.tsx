import { useEffect, useState } from "react";
import { Task } from "../types/Task";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd"

interface TaskListProps {
  refreshSignal?: number;
}

export default function TaskList({ refreshSignal }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  //fetching the tasks
  const fetchTasks = async () => {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (statusFilter) params.append("status", statusFilter);
  if (priorityFilter) params.append("priority", priorityFilter);
  if (categoryFilter) params.append("category", categoryFilter)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks?${params}`);
  const data = await res.json();
  setTasks(data);
};

  //toggling (either tasks is completed or not)
  const toggleComplete = async (id: string, completed: boolean) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    fetchTasks();
  };

  //deleting the tasks
  const deleteTask = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    fetchTasks();
  };

  //handle the editing of the tasks
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

  //handling subtask toggle 
  const handleSubtaskToggle = async (taskId: string, subtaskIndex: number) => {
    const updatedTasks = [...tasks];
    const task = updatedTasks.find((t) => t._id === taskId);
    if (!task) return

    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed
    setTasks(updatedTasks);

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type" : "application/json" },
      body: JSON.stringify({ subtasks: task.subtasks})
    })
  }
  //handling drag order task
  const handleDragEnd = async ( result: DropResult ) => {
    if (!result.destination) return 

    const updatedTasks = Array.from(tasks);
    const [moved] = updatedTasks.splice(result.source.index, 1)
    updatedTasks.splice(result.destination.index, 0, moved)

    const reordered = updatedTasks.map((task, index) => ({...task, orderIndex: index}))
    setTasks(reordered)

    await Promise.all(
      reordered.map((task) => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${task._id}`, {
          method: "PUT",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ orderIndex: task.orderIndex})
        })
      )
    )
  }

  useEffect(() => {
    fetchTasks();
  }, [refreshSignal, search, statusFilter, priorityFilter, categoryFilter]);

  //Rendering the tasks

  const renderTaskWithoutDrag = (task: Task, index: number) => (
    <>
  {/* Toggling the checkbox */}
          <li key={task._id} className="text-black flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task._id!, !task.completed)}
            />
            {/* Edit section */}
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
              //Displaying category, priority and duedate
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

                {task.category && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-200 text-blue-800">
                    {task.category}
                  </span>
                )}

                {task.dueDate && (
                  <span className={`text-black ml-2 text-sm font-semibold px-2 py-0.5 rounded-full ${
                    new Date(task.dueDate).toDateString() === new Date().toDateString()
                    ? "bg-yellow-100 text-yellow-800" // today
                    : new Date(task.dueDate) < new Date()
                    ? "bg-red-100 text-red-800" // overdue
                    : "bg-green-100 text-green-800" // upcoming
                  }`}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}

                {/*Buttons for edit and delete */}
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
          <ul>
            {/* subtask section */}
        {task.subtasks?.map((sub, idx) => (
          <li key={idx} className="pl-4 text-black">
            <input 
              type="checkbox" 
              checked={sub.completed}  
              onChange={() => handleSubtaskToggle(task._id!, idx)}
              />
            <span className={sub.completed ? "line-through" : ""}>
              {sub.title}
            </span>
          </li>
        ))}
      </ul>
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
          {renderTaskWithoutDrag(task, index)}
    </div>
  )}
  </Draggable>
);

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="text"
          placeholder="Search Task..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-gray-500 border px-2 py-1 rounded w-full md:w-1/3"
        />
        <select className="text-black py-1" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <select className="text-black py-1" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option  value="">All Priorites</option>
          <option  value="High">High</option>
          <option  value="Medium">Medium</option>
          <option  value="Low">Low</option>
        </select>
        <select className="text-black py-1" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          <option value="General">General</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      {/* Task lists Section */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div>
          <h3 className="text-black font-bold text-lg">Pending Tasks</h3>
          <Droppable droppableId="tasks">
            {(provided) => (
              <ul 
                className="space y-2"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {tasks.filter(t => !t.completed).map(renderTaskWithDrag)}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </div>
        </DragDropContext>

        <div>
          <h3 className="text-black font-bold text-lg">Completed Tasks</h3>
          <ul>
            {tasks.filter(t => t.completed).map((task, index) => (
              renderTaskWithoutDrag(task, index)
            ))}
          </ul>
        </div>
      
    </div>
  );
}
