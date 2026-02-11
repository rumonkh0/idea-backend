import prisma from "../../config/prisma.js";

export const createBkashTransaction = async ({
  txid,
  amount,
  rawMessage,
  senderNumber,
}) => {
  return prisma.bkashTransaction.create({
    data: {
      txid,
      amount,
      rawMessage,
      senderNumber,
      status: "UNMATCHED",
    },
  });
};

export const findBkashByTxid = async (txid) => {
  return prisma.bkashTransaction.findUnique({ where: { txid } });
};

export const markBkashMatched = async (txid) => {
  return prisma.bkashTransaction.update({
    where: { txid },
    data: { status: "MATCHED" },
  });
};

export const getAllBkashTransactions = async (filter, sortBy, order) => {
  return prisma.bkashTransaction.findMany({
    where: filter,
    orderBy: { [sortBy]: order },
  });
};

export const updateBkashTransaction = async (id, data) => {
  return prisma.bkashTransaction.update({
    where: { id: Number(id) },
    data,
  });
};

export const deleteBkashTransaction = async (id) => {
  return prisma.bkashTransaction.delete({
    where: { id: Number(id) },
  });
};

export const findBkashById = async (id) => {
  return prisma.bkashTransaction.findUnique({
    where: { id: Number(id) },
  });
};
