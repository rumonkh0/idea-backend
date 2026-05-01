import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  addCourse,
  editCourse,
  removeCourse,
  getCourse,
  getCourses,
  addModule,
  editModule,
  removeModule,
  addLesson,
  editLesson,
  removeLesson,
  completeLessonController,
  getCoursesofUser,
  getMyCourses,
  getMySingleCourse,
  getCourseEnrolledUsers,
  getMyCoursesWithProgress,
} from "./course.controller.js";

import { authorize, protect } from "../../middleware/auth.js";
import imageProcess from "../../middleware/imageProcess.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Lesson video upload config ──
const lessonUploadDir = path.join(__dirname, "../../tmp/lesson-videos");

if (!fs.existsSync(lessonUploadDir)) {
  fs.mkdirSync(lessonUploadDir, { recursive: true });
}

const lessonStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(lessonUploadDir)) {
      fs.mkdirSync(lessonUploadDir, { recursive: true });
    }
    cb(null, lessonUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const lessonUpload = multer({
  storage: lessonStorage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
});

// ── Course thumbnail upload config ──
const thumbnailUploadDir = path.join(__dirname, "../../public/uploads/course");

if (!fs.existsSync(thumbnailUploadDir)) {
  fs.mkdirSync(thumbnailUploadDir, { recursive: true });
}

const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(thumbnailUploadDir)) {
      fs.mkdirSync(thumbnailUploadDir, { recursive: true });
    }
    cb(null, thumbnailUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const thumbnailUpload = multer({
  storage: thumbnailStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

/* ===========================
   STUDENT ROUTES
=========================== */

router.get("/me", protect, getMyCourses);
router.get("/me/progress", protect, getMyCoursesWithProgress);
router.get("/:id/me", protect, getMySingleCourse);


// Lesson progress
router.post("/lesson/complete/:lessonId", protect, completeLessonController);

/* ===========================
   PUBLIC ROUTES
=========================== */

router.get("/", getCourses);
router.get("/:id", getCourse);

/* ===========================
   ADMIN ROUTES
=========================== */

router.use(protect, authorize("ADMIN", "SUPERADMIN"));

// Course routes
router.post("/", thumbnailUpload.single("thumbnail"), imageProcess, addCourse);
router.put("/:id", thumbnailUpload.single("thumbnail"), imageProcess, editCourse);
router.get("/:id/enrolled-users", getCourseEnrolledUsers);
router.delete("/:id", removeCourse);
router.get("/user/:userId/", getCoursesofUser);

// Module routes
router.post("/:courseId/module", addModule);
router.put("/module/:id", editModule);
router.delete("/module/:id", removeModule);

// Lesson routes
router.post(
  "/module/:moduleId/lesson",
  lessonUpload.single("video"),
  addLesson,
);
router.put("/lesson/:id", lessonUpload.single("video"), editLesson);
router.delete("/lesson/:id", removeLesson);

export default router;
