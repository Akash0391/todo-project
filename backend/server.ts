import app from "./app";
import { connectDB } from "./config/db";
import startReminderCron from "./utils/scheduler"
import "./utils/scheduler";         
import "../backend/jobs/reminderWorker";  
import { createServer } from 'http';
import { initializeSocket } from './socket/socketServer';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Make io available globally for controllers
declare global {
  var io: any;
}
global.io = io;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server initialized`);
  });

  startReminderCron();
});
