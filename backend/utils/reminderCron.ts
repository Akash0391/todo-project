import dotenv from "dotenv";
dotenv.config();

import cron from "node-cron"
import { Task } from "../models/Task"
import mongoose from "mongoose"
import { sendEmail } from "./sendEmail"

mongoose.connect(process.env.MONGODB_URI!)

export default function startReminderCron() {
    cron.schedule("* * * * *", async () => {
        const now = new Date();

        const tasks = await Task.find({
            reminder: { $lte: now},
            reminderSent: { $ne: true}
        })

        for(const task of tasks) {
            await sendEmail({
                to: "abc@gmail.com", // use any email
                subject: `Reminder: ${task.title}`,
                text: `You set a reminder for this task: ${task.title}`
            })
            await task.save();
        }

        console.log(`Checked reminders at ${now.toLocaleTimeString()}`);
    })

    console.log("Reminder cron job started")
}