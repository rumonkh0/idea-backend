import express from "express";
import {
  getActiveTvMediaReports,
  getAllTvMediaReports,
  getTvMediaReportById,
  addTvMediaReport,
  updateTvMediaReport,
  deleteTvMediaReport,
} from "./tvMedia.controller.js";
import { protect, authorize } from "../../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getActiveTvMediaReports);

// Admin routes
router.get("/all", protect, authorize("ADMIN", "SUPERADMIN"), getAllTvMediaReports);
router.post("/", protect, authorize("ADMIN", "SUPERADMIN"), addTvMediaReport);
router.put("/:id", protect, authorize("ADMIN", "SUPERADMIN"), updateTvMediaReport);
router.delete("/:id", protect, authorize("ADMIN", "SUPERADMIN"), deleteTvMediaReport);

// Parametric public route placed after specific admin routes
router.get("/:id", getTvMediaReportById);

export default router;
