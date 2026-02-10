import express from "express";
import { bkashWebhook } from "./bkash.controller.js";

const router = express.Router();

// Public webhook endpoint for bKash SMS
router.post("/webhook", bkashWebhook);

export default router;
