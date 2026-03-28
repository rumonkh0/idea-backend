// Quiz Routes
const express = require("express");
const router = express.Router();
const quizController = require("./quiz.controller");
const { protect } = require("../../middleware/auth");

// Create a quiz (admin/instructor)
router.post("/", protect, quizController.createQuiz);
// Get quizzes for a lesson
router.get("/lesson/:lessonId", protect, quizController.getQuizzesByLesson);
// Attempt a quiz
router.post("/attempt", protect, quizController.attemptQuiz);
// Get user's quiz attempts
router.get("/attempts", protect, quizController.getUserQuizAttempts);

module.exports = router;
