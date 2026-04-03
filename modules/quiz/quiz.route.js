import express from "express";
import {
  addQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizzesByLesson,
  submitQuizResponse,
  getUserQuizResults,
  getUserLessonQuizResults,
} from "./quiz.controller.js";
import { protect, authorize } from "../../middleware/auth.js";

const router = express.Router();

// Apply protect middleware to all quiz routes
router.use(protect);

// User/Student routes
router.get("/lesson/:lessonId", getQuizzesByLesson);
router.post("/:id/submit", submitQuizResponse);
router.get("/results", getUserQuizResults);
router.get("/results/lesson/:lessonId", getUserLessonQuizResults);

// Admin routes
router.use(authorize("ADMIN", "SUPERADMIN"));
router.post("/", addQuiz);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);

export default router;
