import express from "express";
import { protect, authorize } from "../../middleware/auth.js";
import {
  requestPayment,
  getAllPayments,
  updatePaymentStatus,
  getUserPayments,
} from "./payment.controller.js";

const router = express.Router();

// User requests a payment
router.post("/request", protect, requestPayment);

// Admin views all payments
router.get("/", protect, authorize("ADMIN", "SUPERADMIN"), getAllPayments);

// Admin updates payment status (approve/reject/pending)
router.patch(
  "/:id/status",
  protect,
  authorize("ADMIN", "SUPERADMIN"),
  updatePaymentStatus,
);

// User views own payment history
router.get("/my", protect, getUserPayments);

export default router;
