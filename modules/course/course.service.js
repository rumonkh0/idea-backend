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

export const getAllCoursesWithCounts = async () => {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      thumbnail: true,
      price: true,
      rating: true,
      level: true,
      language: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },
    },
  });

  // Fetch lesson counts and total hours for each course
  const coursesWithDetails = await Promise.all(
    courses.map(async (course) => {
      const modules = await prisma.module.findMany({
        where: { courseId: course.id },
        include: {
          lessons: {
            select: {
              duration: true,
            },
          },
        },
      });

      const lessonCount = modules.reduce(
        (sum, mod) => sum + mod.lessons.length,
        0,
      );
      const totalHours = modules.reduce((sum, mod) => {
        const moduleHours = mod.lessons.reduce((hrs, lesson) => {
          return hrs + (lesson.duration ? Math.ceil(lesson.duration / 60) : 0);
        }, 0);
        return sum + moduleHours;
      }, 0);

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        price: course.price,
        rating: course.rating,
        level: course.level,
        language: course.language,
        status: course.status,
        instructor: course.instructor,
        moduleCount: course._count.modules,
        lessonCount,
        totalHours,
        enrollmentCount: course._count.enrollments,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    }),
  );

  return coursesWithDetails;
};

// MODULE CRUD
export const createModule = async (courseId, data) => {
  const cId = Number(courseId);

  let targetOrder = data.sortOrder;

  if (targetOrder === undefined || targetOrder === null) {
    const lastModule = await prisma.module.findFirst({
      where: { courseId: cId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    targetOrder = lastModule ? lastModule.sortOrder + 1 : 1;
  }

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
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    targetOrder = lastLesson ? lastLesson.sortOrder + 1 : 1;
  }

  return prisma.lesson.create({
    data: {
      ...data,
      sortOrder: targetOrder,
      module: {
        connect: { id: mId },
      },
    },
  });
};

export const updateLesson = async (id, data) => {
  return prisma.lesson.update({ where: { id }, data });
};

export const deleteLesson = async (id) => {
  return prisma.lesson.delete({ where: { id } });
};

// USER COURSES (enrolled)
export const getUserEnrolledCourses = async (userId) => {
  const numericUserId = Number(userId);

  // 1️⃣ Fetch enrollments WITHOUT progress
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: numericUserId },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                omit: {
                  isPreview: true,
                },
              }, 
            },
          },
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // 2️⃣ Fetch all lesson progress for this user
  const lessonProgress = await prisma.lessonProgress.findMany({
    where: { userId: numericUserId },
    select: {
      lessonId: true,
      isCompleted: true,
      completedAt: true,
    },
  });

  // 3️⃣ Create fast lookup map
  const progressMap = new Map(lessonProgress.map((p) => [p.lessonId, p]));

  // 4️⃣ Attach progress to lessons
  const enriched = enrollments.map((enrollment) => {
    const course = enrollment.course;

    if (!course?.modules) return enrollment;

    return {
      ...enrollment,
      course: {
        ...course,
        modules: course.modules.map((mod) => ({
          ...mod,
          lessons: mod.lessons.map((lesson) => {
            const prog = progressMap.get(lesson.id);

            return {
              ...lesson,
              completed: !!prog?.isCompleted,
              completedAt: prog?.completedAt ?? null,
            };
          }),
        })),
      },
    };
  });

  return enriched;
};

// Get a single enrollment by user and course (used for "my" single course view)
export const getUserEnrollment = async (userId, courseId) => {
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: Number(userId), courseId: Number(courseId) },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                include: {
                  progress: {
                    where: { userId: Number(userId) },
                    select: {
                      isCompleted: true,
                      completedAt: true,
                      userId: true,
                      lessonId: true,
                    },
                  },
                },
              },
            },
          },
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!enrollment) return null;

  // Enrich lessons with completion info
  const course = JSON.parse(JSON.stringify(enrollment.course));
  if (course && course.modules) {
    course.modules = course.modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((lesson) => {
        const prog = (lesson.progress && lesson.progress[0]) || null;
        const { progress, ...rest } = lesson;
        const completedFlag = !!prog?.isCompleted;
        return {
          ...rest,
          isCompleted: completedFlag,
          completed: completedFlag,
          completedAt: prog?.completedAt ?? null,
        };
      }),
    }));
  }

  return { ...enrollment, course };
};

// Fetch lesson progress records for a user for a list of lesson IDs
export const getLessonProgressForUser = async (userId, lessonIds) => {
  if (!lessonIds || lessonIds.length === 0) return [];

  return prisma.lessonProgress.findMany({
    where: {
      userId: Number(userId),
      lessonId: { in: lessonIds.map((id) => Number(id)) },
    },
  });
};

// LESSON PROGRESS
export const completeLesson = async (userId, lessonId) => {
  return prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { isCompleted: true, completedAt: new Date() },
    create: { userId, lessonId, isCompleted: true, completedAt: new Date() },
  });
};
