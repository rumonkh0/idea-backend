import prisma from "../../config/prisma.js";

// COURSE CRUD
export const createCourse = async (data) => {
  return prisma.course.create({ data });
};

export const updateCourse = async (id, data) => {
  return prisma.course.update({ where: { id }, data });
};

export const deleteCourse = async (id) => {
  return prisma.course.delete({ where: { id } });
};

export const getCourseWithModulesAndLessons = async (id) => {
  return prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  });
};

export const getAllCourses = async () => {
  return prisma.course.findMany({
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  });
};

// MODULE CRUD
export const createModule = async (courseId, data) => {
  const cId = Number(courseId);

  let targetOrder = data.sortOrder;

  if (targetOrder === undefined || targetOrder === null) {
    const lastModule = await prisma.module.findFirst({
      where: { courseId: cId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    targetOrder = lastModule ? lastModule.sortOrder + 1 : 1;
  };

  return prisma.module.create({
    data: {
      ...data,
      sortOrder: targetOrder,
      course: { connect: { id: cId } },
    },
  });
};

export const updateModule = async (id, data) => {
  return prisma.module.update({ where: { id }, data });
};

export const deleteModule = async (id) => {
  return prisma.module.delete({ where: { id } });
};

// LESSON CRUD
export const createLesson = async (moduleId, data) => {
  const mId = Number(moduleId);

  // 1. Handle auto-sortOrder logic
  let targetOrder = data.sortOrder;

  if (targetOrder === undefined || targetOrder === null) {
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId: mId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    targetOrder = lastLesson ? lastLesson.sortOrder + 1 : 1;
  }

  return prisma.lesson.create({
    data: {
      ...data,
      sortOrder: targetOrder,
      module: {
        connect: { id: mId }
      }
    }
  });
};

export const updateLesson = async (id, data) => {
  return prisma.lesson.update({ where: { id }, data });
};

export const deleteLesson = async (id) => {
  return prisma.lesson.delete({ where: { id } });
};

// LESSON PROGRESS
export const completeLesson = async (userId, lessonId) => {
  return prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { isCompleted: true, completedAt: new Date() },
    create: { userId, lessonId, isCompleted: true, completedAt: new Date() },
  });
};
