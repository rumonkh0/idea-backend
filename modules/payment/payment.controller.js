import asyncHandler from "../../middleware/async.js";
import prisma from "../../config/prisma.js";
import ErrorResponse from "../../utils/errorResponse.js";

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
  const exists = await prisma.payment.findUnique({ where: { transactionId } });
  if (exists)
    return next(new ErrorResponse("Transaction ID already used", 400));
  const payment = await prisma.payment.create({
    data: {
      userId: req.user.id,
      courseId: Number(courseId),
      transactionId,
      amount,
      currency,
      paymentMethod,
      status: "PENDING",
    },
  });
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
  const payments = await prisma.payment.findMany({
    where,
    orderBy: { [sortBy]: order },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
    },
  });
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
  const payment = await prisma.payment.update({
    where: { id: Number(id) },
    data: { status },
  });
  res.json(payment);
});

// User: view own payment history
export const getUserPayments = asyncHandler(async (req, res, next) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { id: true, title: true } },
    },
  });
  res.json(payments);
});
