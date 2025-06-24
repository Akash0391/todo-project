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

  const tasks = await Task.find(query);
  res.json(tasks);
};

//adding the tasks
export const addTask = async (req: Request, res: Response) => {
  const { title, priority, category , dueDate } = req.body;
  const task = await Task.create({ title, priority, category, dueDate });
  res.status(201).json(task);
};

//updating the tasks
export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { completed, title, priority, category, dueDate } = req.body;

  const updateFields: any = {};
  if (completed !== undefined) updateFields.completed = completed;
  if (title !== undefined) updateFields.title = title;
  if (priority !== undefined) updateFields.priority = priority;
  if (category !== undefined) updateFields.completed = completed
  if (dueDate !== undefined) updateFields.dueDate = dueDate


  const task = await Task.findByIdAndUpdate(id, updateFields, { new: true });
  res.json(task);
};

//deleting the tasks
export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Task.findByIdAndDelete(id);
  res.json({ message: "Deleted" });
};