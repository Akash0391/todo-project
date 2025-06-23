import { Request, Response } from "express";
import { Task } from "../models/Task";

export const getTasks = async (_: Request, res: Response) => {
  const tasks = await Task.find();
  res.json(tasks);
};

export const addTask = async (req: Request, res: Response) => {
  const { title, priority } = req.body;
  const task = await Task.create({ title, priority });
  res.status(201).json(task);
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { completed, title, priority } = req.body;

  const updateFields: any = {};
  if (completed !== undefined) updateFields.completed = completed;
  if (title !== undefined) updateFields.title = title;
  if (priority !== undefined) updateFields.priority = priority;

  const task = await Task.findByIdAndUpdate(id, updateFields, { new: true });
  res.json(task);
};


export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Task.findByIdAndDelete(id);
  res.json({ message: "Deleted" });
};


