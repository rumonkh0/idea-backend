// Quiz Controller
const quizService = require("./quiz.service");

module.exports = {
  // Create a new quiz
  async createQuiz(req, res, next) {
    try {
      const quiz = await quizService.createQuiz(req.body);
      res.status(201).json({ success: true, data: quiz });
    } catch (err) {
      next(err);
    }
  },

  // Get quizzes for a lesson
  async getQuizzesByLesson(req, res, next) {
    try {
      const quizzes = await quizService.getQuizzesByLesson(req.params.lessonId);
      res.status(200).json({ success: true, data: quizzes });
    } catch (err) {
      next(err);
    }
  },

  // Attempt a quiz
  async attemptQuiz(req, res, next) {
    try {
      const result = await quizService.attemptQuiz(req.user.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  // Get attempts for a user
  async getUserQuizAttempts(req, res, next) {
    try {
      const attempts = await quizService.getUserQuizAttempts(req.user.id);
      res.status(200).json({ success: true, data: attempts });
    } catch (err) {
      next(err);
    }
  },
};
