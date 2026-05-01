import express from "express";
import { generateCertificate } from "./certificate.controller.js";
import { protect } from "../../middleware/auth.js";

const router = express.Router();

router.post("/generate", protect, generateCertificate);


export default router;
