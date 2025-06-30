import Queue from "bull";
import dotenv from "dotenv";
dotenv.config();

export const reminderQueue = new Queue("reminders", process.env.REDIS_URL!);
