import dotenv from "dotenv";
dotenv.config();

import cron from "node-cron";
import { Task } from "../models/Task";
import mongoose from "mongoose";
import { reminderQueue } from "./queue";

mongoose.connect(process.env.MONGODB_URI!);

export default function startReminderCron() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    const tasks = await Task.find({
      reminder: { $lte: now },
      reminderSent: { $ne: true },
    });

    for (const task of tasks) {
      // Enqueue the task to the queue
      await reminderQueue.add({ taskId: task._id });

      // Optionally update to prevent duplicate enqueue
      task.reminder = true;
      await task.save();
    }

    console.log(
      `Cron: Queued ${tasks.length} task(s) at ${now.toLocaleTimeString()}`
    );
  });

  console.log("Reminder cron job started");
}
