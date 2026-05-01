import prisma from "../../config/prisma.js";
import fs from "fs";
import path from "path";
import { getVideoDuration } from "../../utils/videoUtils.js";

const getBunnyConfig = () => {
  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const accessKey = process.env.BUNNY_STREAM_API_KEY;
  const hostname = process.env.BUNNY_STREAM_HOSTNAME;

  if (!libraryId || !accessKey || !hostname) {
    throw new Error("Bunny Stream configuration missing");
  }

  return { libraryId, accessKey, hostname };
};

export const uploadLessonVideoToBunny = async ({
  filePath,
  mimeType,
  title,
}) => {
  const { libraryId, accessKey, hostname } = getBunnyConfig();
  await fs.promises.access(filePath, fs.constants.R_OK);

  // Extract duration if it's a video
  let duration = null;
  if (mimeType && mimeType.startsWith("video/")) {
    duration = await getVideoDuration(filePath);
  }

  const createRes = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: accessKey,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({ title }),
    },
  );

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Bunny create video failed: ${errorText}`);
  }

  const created = await createRes.json();
  const videoId = created?.guid || created?.videoId || created?.id;
  if (!videoId) {
    throw new Error("Bunny create video failed: missing video id");
  }

  const stream = fs.createReadStream(filePath);
  const uploadRes = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
    {
      method: "PUT",
      duplex: "half",
      headers: {
        AccessKey: accessKey,
        accept: "application/json",
        "content-type": mimeType || "application/octet-stream",
      },
      body: stream,
    },
  );

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Bunny upload failed: ${errorText}`);
  }

  await fs.promises.unlink(filePath).catch(() => null);

  const videoUrl = `https://${hostname}/${videoId}/playlist.m3u8`;

  return {
    videoId,
    libraryId: Number(libraryId),
    videoUrl,
    duration,
  };
};

// COURSE CRUD

const getMediaType = (mimeType) => {
  if (!mimeType) return "FILE";
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  return "FILE";
};

const deleteFileIfExists = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
};

const deleteMediaFile = async (media) => {
  if (!media?.url) return;
  const publicRoot = path.join(process.cwd(), "public");
  await deleteFileIfExists(path.join(publicRoot, media.url));
};

export const createThumbnailMedia = async (file) => {
  const url = `/uploads/course/${file.filename}`;
  return prisma.media.create({
    data: {
      url,
      type: getMediaType(file.mimetype),
      provider: "local",
      alt: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    },
  });
};

export const createCourse = async (data) => {
  const { thumbnailId, ...rest } = data;
  return prisma.course.create({
    data: {
      ...rest,
      ...(thumbnailId
        ? { thumbnailMedia: { connect: { id: thumbnailId } } }
        : {}),
    },
    include: { thumbnailMedia: true },
  });
};

export const updateCourse = async (id, data) => {
  const { thumbnailId, ...rest } = data;

  // If a new thumbnail is being set, clean up the old one
  if (thumbnailId) {
    const existing = await prisma.course.findUnique({
      where: { id },
      include: { thumbnailMedia: true },
    });

    if (existing?.thumbnailMedia) {
      // Disconnect + delete old media
      await prisma.course.update({
        where: { id },
        data: { thumbnailMedia: { disconnect: true } },
      });
      await deleteMediaFile(existing.thumbnailMedia);
      await prisma.media.delete({
        where: { id: existing.thumbnailMedia.id },
      });
    }
  }

  return prisma.course.update({
    where: { id },
    data: {
      ...rest,
      ...(thumbnailId
        ? { thumbnailMedia: { connect: { id: thumbnailId } } }
        : {}),
    },
    include: { thumbnailMedia: true },
  });
};

export const deleteCourse = async (id) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: { thumbnailMedia: true },
  });
  if (!course) return null;

  await prisma.course.delete({ where: { id } });

  // Clean up thumbnail media
  if (course.thumbnailMedia) {
    await deleteMediaFile(course.thumbnailMedia);
    await prisma.media
      .delete({ where: { id: course.thumbnailMedia.id } })
      .catch(() => null);
  }

  return course;
};

export const getCourseById = async (id) => {
  return prisma.course.findUnique({ where: { id: Number(id) } });
};

export const getCourseWithModulesAndLessons = async (id) => {
  return prisma.course.findUnique({
    where: { id },
    include: {
      thumbnailMedia: true,
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
      thumbnailMedia: true,
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

// USER COURSES with Progress Percentage
export const getUserEnrolledCoursesWithProgress = async (userId) => {
  const numericUserId = Number(userId);

  // 1. Fetch enrollments with course details
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: numericUserId },
    include: {
      course: {
        include: {
          _count: {
            select: {
              modules: true,
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

  // 2. Fetch all lesson counts and progress for these courses
  const enriched = await Promise.all(
    enrollments.map(async (enrollment) => {
      const courseId = enrollment.courseId;

      // Get total lessons in course
      const totalLessons = await prisma.lesson.count({
        where: {
          module: {
            courseId: courseId,
          },
        },
      });

      // Get completed lessons for user in this course
      const completedLessons = await prisma.lessonProgress.count({
        where: {
          userId: numericUserId,
          isCompleted: true,
          lesson: {
            module: {
              courseId: courseId,
            },
          },
        },
      });

      const progressPercent =
        totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      return {
        ...enrollment,
        totalLessons,
        completedLessons,
        progressPercent: Math.round(progressPercent),
      };
    }),
  );

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
  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { isCompleted: true, completedAt: new Date() },
    create: { userId, lessonId, isCompleted: true, completedAt: new Date() },
    include: {
      lesson: {
        include: {
          module: true,
        },
      },
    },
  });

  // Check if course is now fully completed
  const courseId = progress.lesson.module.courseId;

  // Get total lessons in course
  const totalLessonsCount = await prisma.lesson.count({
    where: {
      module: {
        courseId: courseId,
      },
    },
  });

  // Get completed lessons for user in this course
  const completedLessonsCount = await prisma.lessonProgress.count({
    where: {
      userId,
      isCompleted: true,
      lesson: {
        module: {
          courseId: courseId,
        },
      },
    },
  });

  // If all lessons are completed, update enrollment status
  if (totalLessonsCount > 0 && totalLessonsCount === completedLessonsCount) {
    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        status: "COMPLETED",
      },
    });
  }

  return progress;
};

// Fetch all users enrolled in a specific course
export const getEnrolledUsersByCourseId = async (courseId) => {
  return prisma.enrollment.findMany({
    where: { courseId: Number(courseId) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });
};
