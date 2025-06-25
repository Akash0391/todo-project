import express from "express";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  reorderTask,
} from "../controllers/taskController";
import { Task } from "../models/Task";

const router = express.Router();

router.get("/", getTasks);
router.post("/", addTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/reorder", reorderTask)

export default router;
