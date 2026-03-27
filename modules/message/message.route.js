import express from "express";
import {
  sendMessage,
  getAllMessages,
  getMessageById,
  deleteMessage,
} from "./message.controller.js";
import { protect, authorize } from "../../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/", sendMessage);

// Admin routes
router.use(protect, authorize("ADMIN", "SUPERADMIN"));
router.get("/", getAllMessages);
router.get("/:id", getMessageById);
router.delete("/:id", deleteMessage);

export default router;
