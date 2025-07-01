import mongoose from "mongoose";
import { Task } from "../models/Task";
import dotenv from 'dotenv'

dotenv.config();


const sampleTasks = [
    {
        title: "Write seeder script",
        description: "Create a script to populate sample task in mongodb",
        priority: "High",
        completed: false,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        category: "Development",
        tags: ["typescript", "seed"],
        subtasks: [
            { title: "Create file", completed: true },
            { title: "Write task list", completed: true },
            { title: "Insert into DB", completed: false},
        ],
        orderIndex: 1,
    },
    {
        title: "Setup cron job reminders",
        description: "Ensure tasks with reminders are handled",
        priority: "Medium",
        completed: false,
        dueDate: new Date(),
        category: "Automation",
        tags: ["cron", "reminder"],
        subtasks: [],
        orderIndex: 2,
    },
    {
        title: "Clean old tasks",
        description: "Clear out development data",
        priority: "Low",
        completed: true,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        category: "Maintenance",
        tags: ["cleanup"],
        subtasks: [],
        orderIndex: 3,
    }
]

async function seedtasks() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!)
        console.log("Connected to database")

        await Task.deleteMany();
        console.log("Old tasks removed")

        await Task.insertMany(sampleTasks)
        console.log("Sample task inserted")

        process.exit(0)
    } catch (error) {
        console.error("Seeding faile", error)
        process.exit(1)
    }
}

seedtasks();