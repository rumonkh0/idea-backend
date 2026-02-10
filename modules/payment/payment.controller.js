import asyncHandler from "../../middleware/async.js";
import prisma from "../../config/prisma.js";
import ErrorResponse from "../../utils/errorResponse.js";
import {
  createPayment,
  findPaymentByTxId,
  findAllPayments,
  updatePaymentStatusById,
  findPaymentsByUser,
} from "./payment.service.js";
import { findBkashByTxid, markBkashMatched } from "./bkash.service.js";

// User requests a payment (status: PENDING)
export const requestPayment = asyncHandler(async (req, res, next) => {
  const { courseId, transactionId, amount, currency, paymentMethod } = req.body;
  if (!courseId || !transactionId || !amount || !currency || !paymentMethod) {
    return next(new ErrorResponse("All fields are required", 400));
  }
  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: Number(courseId) },
  });
  if (!course) return next(new ErrorResponse("Course not found", 404));
  // Check for duplicate txid
  const exists = await findPaymentByTxId(transactionId);
  if (exists)
    return next(new ErrorResponse("Transaction ID already used", 400));
  const payment = await createPayment(req.user.id, {
    courseId,
    transactionId,
    amount,
    currency,
    paymentMethod,
  });

  // Immediately check if a bKash transaction with same txid already exists
  const bkashTx = await findBkashByTxid(transactionId);
  if (bkashTx && Number(bkashTx.amount) === Number(amount)) {
    await updatePaymentStatusById(payment.id, "SUCCESS");
    await markBkashMatched(transactionId);
    const updated = await updatePaymentStatusById(payment.id, "SUCCESS");
    return res.status(201).json(updated);
  }
  res.status(201).json(payment);
});

// Admin: view all payments (with filters)
export const getAllPayments = asyncHandler(async (req, res, next) => {
  const {
    status,
    userId,
    courseId,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;
  const where = {};
  if (status) where.status = status;
  if (userId) where.userId = Number(userId);
  if (courseId) where.courseId = Number(courseId);
  const payments = await findAllPayments(where, sortBy, order);
  res.json(payments);
});

// Admin: update payment status (approve/reject/pending)
export const updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["SUCCESS", "FAILED", "PENDING"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse("Invalid status", 400));
  }
  const payment = await updatePaymentStatusById(id, status);
  res.json(payment);
});

// User: view own payment history
export const getUserPayments = asyncHandler(async (req, res, next) => {
  const payments = await findPaymentsByUser(req.user.id);
  res.json(payments);
});
