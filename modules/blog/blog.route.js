import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  addBlog,
  editBlog,
  deleteBlog,
  removeGalleryImage,
  publishBlog,
  getAllBlogs,
  getBlogById,
  getPublishedBlogs,
  getPublishedBlogBySlug,
} from "./blog.controller.js";
import { protect, authorize } from "../../middleware/auth.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../public/uploads/blog");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
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

const blogUpload = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
]);

// User routes
router.get("/", getPublishedBlogs);
router.get("/slug/:slug", getPublishedBlogBySlug);


// Admin routes
router.use(protect, authorize("ADMIN", "SUPERADMIN"));
router.post("/", blogUpload, addBlog);
router.put("/:id", blogUpload, editBlog);
router.delete("/:id", deleteBlog);
router.delete("/:id/gallery/:mediaId", removeGalleryImage);
router.patch("/:id/publish", publishBlog);
router.get("/all", getAllBlogs);
router.get("/id/:id", getBlogById);


export default router;
