import asyncHandler from "../../middleware/async.js";
import * as quizService from "./quiz.service.js";
import ErrorResponse from "../../utils/errorResponse.js";

// -- Admin Controllers --

// @desc    Add quiz
// @route   POST /api/v1/quizzes
// @access  Private/Admin
export const addQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await quizService.createQuiz(req.body);
  res.status(201).json({
    success: true,
    message: "Quiz created successfully",
    data: quiz,
  });
});

// @desc    Update quiz
// @route   PUT /api/v1/quizzes/:id
// @access  Private/Admin
export const updateQuiz = asyncHandler(async (req, res, next) => {
  let quiz = await quizService.getQuizById(req.params.id);
  if (!quiz) {
    return next(new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404));
  }
  quiz = await quizService.updateQuiz(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Quiz updated successfully",
    data: quiz,
  });
});

// @desc    Delete quiz
// @route   DELETE /api/v1/quizzes/:id
// @access  Private/Admin
export const deleteQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await quizService.getQuizById(req.params.id);
  if (!quiz) {
    return next(new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404));
  }
  await quizService.deleteQuiz(req.params.id);
  res.status(200).json({
    success: true,
    message: "Quiz deleted successfully",
    data: null,
  });
});

// -- Admin/User Controllers --

// @desc    Get quizzes by lesson
// @route   GET /api/v1/quizzes/lesson/:lessonId
// @access  Private
export const getQuizzesByLesson = asyncHandler(async (req, res, next) => {
  const quizzes = await quizService.getQuizzesByLesson(req.params.lessonId);
  res.status(200).json({
    success: true,
    count: quizzes.length,
    data: quizzes,
  });
});

// -- User Controllers --

// @desc    Submit quiz response
// @route   POST /api/v1/quizzes/:id/submit
// @access  Private
export const submitQuizResponse = asyncHandler(async (req, res, next) => {
  const { userAnswer } = req.body;
  if (userAnswer === undefined) {
    return next(new ErrorResponse("userAnswer is required", 400));
  }

  const response = await quizService.submitQuizResponse(
    req.user.id,
    req.params.id,
    userAnswer
  );

  res.status(201).json({
    success: true,
    message: response.isCorrect ? "Correct answer!" : "Incorrect answer.",
    data: response,
  });
});

// @desc    Get user quiz results
// @route   GET /api/v1/quizzes/results
// @access  Private
export const getUserQuizResults = asyncHandler(async (req, res, next) => {
  const results = await quizService.getUserQuizResults(req.user.id);
  res.status(200).json({
    success: true,
    count: results.length,
    data: results,
  });
});
