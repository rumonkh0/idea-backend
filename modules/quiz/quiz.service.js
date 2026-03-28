// Quiz Service
const prisma = require("../../config/prisma");

module.exports = {
  async createQuiz(data) {
    // options should be array, correctAns should be value or index
    return prisma.quiz.create({
      data: { ...data, options: JSON.stringify(data.options) },
    });
  },

  async getQuizzesByLesson(lessonId) {
    return prisma.quiz.findMany({ where: { lessonId: Number(lessonId) } });
  },

  async attemptQuiz(userId, { quizId, selectedAns }) {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new Error("Quiz not found");
    const isCorrect = quiz.correctAns === selectedAns;
    const attempt = await prisma.quizAttempt.upsert({
      where: { userId_quizId: { userId, quizId } },
      update: { selectedAns, isCorrect },
      create: { userId, quizId, selectedAns, isCorrect },
    });
    return { attempt, isCorrect, point: isCorrect ? quiz.point : 0 };
  },

  async getUserQuizAttempts(userId) {
    return prisma.quizAttempt.findMany({ where: { userId } });
  },
};
