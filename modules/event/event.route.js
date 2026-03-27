import express from "express";
import {
  getAllEvents,
  getEventById,
  addEvent,
  updateEvent,
  deleteEvent,
  getActiveEvents,
  getActiveEventById,
} from "./event.controller.js";
import { protect, authorize } from "../../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getActiveEvents);

// Admin routes
router.use(protect, authorize("ADMIN", "SUPERADMIN"));
router.get("/all", getAllEvents);
router.get("/:id", getEventById);
router.post("/", addEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

// // Public routes (Active only) - Parametric route moved to bottom to avoid shadowing
// router.get("/:id", getActiveEventById);

export default router;
