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
