import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  getActiveNewspaperClips,
  getAllNewspaperClips,
  getNewspaperClipById,
  addNewspaperClip,
  updateNewspaperClip,
  deleteNewspaperClip,
} from "./newspaperClip.controller.js";
import { protect, authorize } from "../../middleware/auth.js";
import imageProcess from "../../middleware/imageProcess.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../public/uploads/newspaper");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Public routes
router.get("/", getActiveNewspaperClips);

// Admin routes
router.get("/all", protect, authorize("ADMIN", "SUPERADMIN"), getAllNewspaperClips);
router.post(
  "/",
  protect,
  authorize("ADMIN", "SUPERADMIN"),
  upload.single("image"),
  imageProcess,
  addNewspaperClip
);
router.put(
  "/:id",
  protect,
  authorize("ADMIN", "SUPERADMIN"),
  upload.single("image"),
  imageProcess,
  updateNewspaperClip
);
router.delete("/:id", protect, authorize("ADMIN", "SUPERADMIN"), deleteNewspaperClip);

// Parametric public route placed after specific admin routes
router.get("/:id", getNewspaperClipById);

export default router;
