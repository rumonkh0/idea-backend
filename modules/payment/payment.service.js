import prisma from "../../config/prisma.js";

export const createPayment = async (userId, data) => {
  return prisma.payment.create({
    data: {
      userId,
      courseId: Number(data.courseId),
      transactionId: data.transactionId,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      status: "PENDING",
    },
  });
};

export const findPaymentByTxId = async (transactionId) => {
  return prisma.payment.findUnique({ where: { transactionId } });
};

export const findAllPayments = async (filter, sortBy, order) => {
  return prisma.payment.findMany({
    where: filter,
    orderBy: { [sortBy]: order },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
    },
  });
};

export const updatePaymentStatusById = async (id, status) => {
  // Get the payment record to retrieve userId and courseId
  const payment = await prisma.payment.findUnique({
    where: { id: Number(id) },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  // Update payment status
  const updatedPayment = await prisma.payment.update({
    where: { id: Number(id) },
    data: { status },
  });

  // If status is SUCCESS, create enrollment record
  if (status === "SUCCESS") {
    await prisma.enrollment.create({
      data: {
        userId: payment.userId,
        courseId: payment.courseId,
        status: "ACTIVE",
      },
    });
  }

  return updatedPayment;
};

export const findPaymentsByUser = async (userId) => {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { id: true, title: true } },
    },
  });
};

export const findPendingPaymentByTxidAndAmount = async (txid, amount) => {
  return prisma.payment.findFirst({
    where: {
      transactionId: txid,
      amount: Number(amount),
      status: "PENDING",
    },
  });
};
