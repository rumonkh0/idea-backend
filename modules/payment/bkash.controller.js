import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utils/errorResponse.js";
import {
  createBkashTransaction,
  findBkashByTxid,
  markBkashMatched,
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
    return res.status(201).json({ message: "Stored unparsable message", tx });
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
    return res
      .status(200)
      .json({ message: "Matched and approved payment", paymentId: payment.id });
  }

  res.status(201).json({ message: "Transaction stored", tx: existing });
});
