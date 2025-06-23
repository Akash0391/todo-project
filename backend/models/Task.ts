import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium",
  }
});

export const Task = mongoose.model("Task", taskSchema);
