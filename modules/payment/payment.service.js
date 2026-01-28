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
  return prisma.payment.update({
    where: { id: Number(id) },
    data: { status },
  });
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
