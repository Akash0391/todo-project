import mongoose, { Schema, Document, Types } from "mongoose";
import { IUser } from "./User"; // Import the User interface

export interface ITask extends Document {
  title: string;
  completed: boolean;
  priority: "High" | "Medium" | "Low";
  category: string;
  subtasks: Types.DocumentArray<any>; 
  orderIndex: number;
  dueDate?: Date;
  reminder?: Date;
  reminderSent?: boolean;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ["High", "Medium", "Low"] },
    category: { type: String },
    subtasks: [{ title: String, completed: Boolean }],
    orderIndex: Number,
    dueDate: Date,
    reminder: Date,
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taskSchema.index({ title: "text", description: "text" });
export const Task = mongoose.model<ITask>("Task", taskSchema);