import { reminderQueue } from "../utils/queue";
import { Task } from "../models/Task";
import { sendEmail } from "../utils/sendEmail";

reminderQueue.process(async (job) => {
  try {
    const task = await Task.findById(job.data.taskId);
    if (!task) {
      console.log(`Task not found for ID: ${job.data.taskId}`);
      return;
    }

    await sendEmail({
      to: "abc@gmail.com", 
      subject: `Reminder: ${task.title}`,
      text: `You set a reminder for this task: ${task.title}`,
    });

    console.log(`Reminder sent for task: ${task.title}`);
  } catch (err) {
    console.error("Error processing reminder job:", err);
  }
});
