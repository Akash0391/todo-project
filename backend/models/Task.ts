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
    reminder: {type: Date}
  },
  { timestamps: true }
);

taskSchema.index({ title: "text", description: "text" });

export const Task = mongoose.model("Task", taskSchema);
