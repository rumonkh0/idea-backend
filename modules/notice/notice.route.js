import express from "express";
import {
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} from "./notice.controller.js";
import { protect, authorize } from "../../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllNotices);
router.get("/:id", getNoticeById);

// Admin routes
router.post("/", protect, authorize("ADMIN", "SUPERADMIN"), createNotice);
router.put("/:id", protect, authorize("ADMIN", "SUPERADMIN"), updateNotice);
router.delete("/:id", protect, authorize("ADMIN", "SUPERADMIN"), deleteNotice);

export default router;
