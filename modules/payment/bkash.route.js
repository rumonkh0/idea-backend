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
router.get(
  "/",
  protect,
  authorize("ADMIN", "SUPERADMIN"),
  getAllBkashTransactions_Handler,
);
router.get(
  "/:id",
  protect,
  authorize("ADMIN", "SUPERADMIN"),
  getBkashTransaction,
);
router.patch(
  "/:id",
  protect,
  authorize("ADMIN", "SUPERADMIN"),
  updateBkashTransaction_Handler,
);
router.delete(
  "/:id",
  protect,
  authorize("ADMIN", "SUPERADMIN"),
  deleteBkashTransaction_Handler,
);

export default router;
