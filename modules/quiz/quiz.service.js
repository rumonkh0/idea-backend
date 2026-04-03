import prisma from "../../config/prisma.js";

// -- Admin Functions --

export const createQuiz = async (data) => {
  return prisma.quiz.create({
    data,
  });
};

export const updateQuiz = async (id, data) => {
  return prisma.quiz.update({
    where: { id: parseInt(id) },
    data,
  });
};

export const deleteQuiz = async (id) => {
  return prisma.quiz.delete({
    where: { id: parseInt(id) },
  });
};

// -- Admin/User Functions --

export const getQuizzesByLesson = async (lessonId) => {
  return prisma.quiz.findMany({
    where: { lessonId: parseInt(lessonId) },
    orderBy: { videoCheckpoint: "asc" },
  });
};

export const getQuizById = async (id) => {
  return prisma.quiz.findUnique({
    where: { id: parseInt(id) },
    include: { lesson: true },
  });
};

// -- User Functions --

export const submitQuizResponse = async (userId, quizId, userAnswer) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: parseInt(quizId) },
  });

  if (!quiz) throw new Error("Quiz not found");

  const isCorrect = quiz.correctAnswer === userAnswer;
  const pointsEarned = isCorrect ? quiz.point : 0;

  return prisma.quizResponse.create({
    data: {
      userId,
      quizId: parseInt(quizId),
      userAnswer,
      isCorrect,
      pointsEarned,
    },
  });
};

export const getUserQuizResults = async (userId) => {
  return prisma.quizResponse.findMany({
    where: { userId },
    include: {
      quiz: {
        include: { lesson: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getUserLessonQuizResults = async (userId, lessonId) => {
  return prisma.quizResponse.findMany({
    where: {
      userId,
      quiz: {
        lessonId: parseInt(lessonId),
      },
    },
    include: {
      quiz: {
        include: { lesson: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
