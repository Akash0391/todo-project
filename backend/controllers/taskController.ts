import { Request, Response } from "express";
import { Task } from "../models/Task";

export const getTasks = async (req: Request, res: Response) => {
  const { search, status, priority, category } = req.query;

  const query: any = {};

  // Search in title or description (text index)
  if (search) {
    query.$text = { $search: String(search) };
  }

  // Filter by status
  if (status === "completed") query.completed = true;
  if (status === "pending") query.completed = false;

  // Filter by priority
  if (priority) query.priority = priority;

  //Filter by category
  if (category) query.category = category;

  const tasks = await Task.find(query).sort({orderIndex: 1});
  res.json(tasks);
};

//adding the tasks
export const addTask = async (req: Request, res: Response) => {
  const { title, priority, category , dueDate, subtasks, userId } = req.body;
  const task = await Task.create({ title, priority, category, dueDate, subtasks, userId});
  res.status(201).json(task);
};

//updating the tasks
export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { completed, title, priority, category, dueDate, subtasks} = req.body;

  const updateFields: any = {};
  if (completed !== undefined) updateFields.completed = completed;
  if (title !== undefined) updateFields.title = title;
  if (priority !== undefined) updateFields.priority = priority;
  if (category !== undefined) updateFields.completed = completed
  if (dueDate !== undefined) updateFields.dueDate = dueDate
  if (subtasks !== undefined) updateFields.subtasks = subtasks

  const task = await Task.findByIdAndUpdate(id, updateFields, { new: true });
  res.json(task);
};

//deleting the tasks
export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Task.findByIdAndDelete(id);
  res.json({ message: "Deleted" });
};

export const reorderTask = async (req: Request, res: Response) => {
  const updates: {id: string; orderIndex: number}[] = req.body.tasks;

  await Promise.all(
    updates.map(({ id, orderIndex }) =>
      Task.findByIdAndUpdate(id, { orderIndex })
    )
  );

  res.status(200).json({ success: true });
};
