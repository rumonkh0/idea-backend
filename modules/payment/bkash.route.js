import express from "express";
import { protect, authorize } from "../../middleware/auth.js";
import {
  bkashWebhook,
  getAllBkashTransactions_Handler,
  getBkashTransaction,
  updateBkashTransaction_Handler,
  deleteBkashTransaction_Handler,
} from "./bkash.controller.js";

const router = express.Router();

// Public webhook endpoint for bKash SMS
router.post("/webhook", bkashWebhook);

// Admin routes (protected, admin/superadmin only)
router.use(protect, authorize("ADMIN", "SUPERADMIN"));

router.get("/", getAllBkashTransactions_Handler);
router.get("/:id", getBkashTransaction);
router.patch("/:id", updateBkashTransaction_Handler);
router.delete("/:id", deleteBkashTransaction_Handler);

export default router;
