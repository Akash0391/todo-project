import { reminderQueue } from "../utils/queue";
import { Task, ITask } from "../models/Task";
import { IUser } from "../models/User";
import { sendEmail } from "../utils/sendEmail";


reminderQueue.process(async (job) => {
  try {
    const task = await Task.findById(job.data.taskId).populate<{ userId: IUser}>("userId");
    if (!task || !task.userId) return;

    const user = task.userId as IUser;

    // Email reminder
    if (user.notifications?.email) {
      await sendEmail({
        to: user.email,
        subject: `Reminder: ${task.title}`,
        text: `You set a reminder for this task: ${task.title}`,
      });
      console.log(`Email sent to ${user.email}`);
    }

  } catch (err) {
    console.error("Failed to send reminder:", err);
  }
});
