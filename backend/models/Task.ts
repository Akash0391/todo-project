import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    category: {type: String, default: "General"},
    dueDate: {type: Date},
    reminder: {type: Date},
    subtasks: [
      {
        title: String,
        completed: { type: Boolean, default: false}
      }
    ],
    orderIndex: {type: Number, default: 0}
  },  
  { timestamps: true }
);

taskSchema.index({ title: "text", description: "text" });

export const Task = mongoose.model("Task", taskSchema);
