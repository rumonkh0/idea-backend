import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utils/errorResponse.js";
import {
  createBkashTransaction,
  findBkashByTxid,
  markBkashMatched,
  getAllBkashTransactions,
  updateBkashTransaction,
  deleteBkashTransaction,
  findBkashById,
} from "./bkash.service.js";
import {
  findPendingPaymentByTxidAndAmount,
  updatePaymentStatusById,
} from "./payment.service.js";

// Parses SMS body, stores bkash transaction, and attempts to auto-match
export const bkashWebhook = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  if (!message) return next(new ErrorResponse("Message body required", 400));

  const rawMessage = String(message);

  // Extract amount: look for 'Tk' followed by number
  const amountMatch = rawMessage.match(/Tk\s*([\d,]+(?:\.\d+)?)/i);
  const txidMatch = rawMessage.match(/TrxID[:\s-]*([A-Za-z0-9]+)/i);
  const senderMatch = rawMessage.match(/from\s+(\+?\d+)/i);

  if (!amountMatch || !txidMatch) {
    // still store raw message as unmatched
    const tx = await createBkashTransaction({
      txid: `unknown-${Date.now()}`,
      amount: 0,
      rawMessage,
      senderNumber: senderMatch ? senderMatch[1] : null,
    });
    return res.status(201).json({
      success: true,
      message: "Stored unparsable message",
      data: tx,
    });
  }

  const amount = parseFloat(amountMatch[1].replace(/,/g, ""));
  const txid = txidMatch[1];
  const senderNumber = senderMatch ? senderMatch[1] : null;

  // Create transaction if not exists
  let existing = await findBkashByTxid(txid);
  if (!existing) {
    existing = await createBkashTransaction({
      txid,
      amount,
      rawMessage,
      senderNumber,
    });
  }

  // Try to find matching pending payment request
  const payment = await findPendingPaymentByTxidAndAmount(txid, amount);
  if (payment) {
    // Approve payment and mark tx matched
    await updatePaymentStatusById(payment.id, "SUCCESS");
    await markBkashMatched(txid);
    return res.status(200).json({
      success: true,
      message: "Transaction matched and payment approved",
      data: { transactionId: existing.id, paymentId: payment.id },
    });
  }

  res.status(201).json({
    success: true,
    message: "Transaction stored successfully",
    data: existing,
  });
});

// Admin: view all bkash transactions with filters
export const getAllBkashTransactions_Handler = asyncHandler(
  async (req, res, next) => {
    const { status, txid, sortBy = "createdAt", order = "desc" } = req.query;
    const where = {};
    if (status) where.status = status;
    if (txid) where.txid = txid;

    const transactions = await getAllBkashTransactions(where, sortBy, order);
    res.status(200).json({
      success: true,
      message: "Bkash transactions retrieved successfully",
      data: transactions,
      count: transactions.length,
    });
  },
);

// Admin: view single bkash transaction
export const getBkashTransaction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const transaction = await findBkashById(id);
  if (!transaction) {
    return next(new ErrorResponse("Transaction not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Bkash transaction retrieved successfully",
    data: transaction,
  });
});

// Admin: update bkash transaction status or other fields
export const updateBkashTransaction_Handler = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;
    const { status, senderNumber } = req.body;
    const validStatuses = ["UNMATCHED", "MATCHED"];

    const update = {};
    if (status && validStatuses.includes(status)) update.status = status;
    if (senderNumber !== undefined) update.senderNumber = senderNumber;

    if (Object.keys(update).length === 0) {
      return next(new ErrorResponse("No valid fields to update", 400));
    }

    const transaction = await updateBkashTransaction(id, update);
    res.status(200).json({
      success: true,
      message: "Bkash transaction updated successfully",
      data: transaction,
    });
  },
);

// Admin: delete bkash transaction
export const deleteBkashTransaction_Handler = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;
    const transaction = await findBkashById(id);
    if (!transaction) {
      return next(new ErrorResponse("Transaction not found", 404));
    }
    await deleteBkashTransaction(id);
    res.status(200).json({
      success: true,
      message: "Bkash transaction deleted successfully",
      data: null,
    });
  },
);
