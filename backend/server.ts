import app from "./app";
import { connectDB } from "./config/db";
import startReminderCron from "./utils/scheduler"
import "./utils/scheduler";         
import "../backend/jobs/reminderWorker";  


const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  startReminderCron();
});
