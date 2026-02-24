import asyncHandler from "../../middleware/async.js";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseWithModulesAndLessons,
  getAllCourses,
  getAllCoursesWithCounts,
  getUserEnrolledCourses,
  getUserEnrollment,
  getLessonProgressForUser,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  completeLesson,
} from "./course.service.js";

// COURSE
export const addCourse = asyncHandler(async (req, res, next) => {
  const course = await createCourse(req.body);
  res.status(201).json({
    success: true,
    message: "Course created successfully",
    data: course,
  });
});

export const editCourse = asyncHandler(async (req, res, next) => {
  const course = await updateCourse(Number(req.params.id), req.body);
  res.status(200).json({
    success: true,
    message: "Course updated successfully",
    data: course,
  });
});

export const removeCourse = asyncHandler(async (req, res, next) => {
  await deleteCourse(Number(req.params.id));
  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
    data: null,
  });
});

export const getCourse = asyncHandler(async (req, res, next) => {
  const courseId = Number(req.params.id);
  const course = await getCourseWithModulesAndLessons(courseId);

  if (!course) {
    return res
      .status(404)
      .json({ success: false, message: "Course not found", data: null });
  }

  // If requester is admin/superadmin, return full data
  if (
    req.user &&
    (req.user.role === "ADMIN" || req.user.role === "SUPERADMIN")
  ) {
    return res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: course,
    });
  }

  // Helper to strip videoUrl for non-preview lessons
  const hideVideosForNonPreviews = (courseObj) => {
    courseObj.modules = courseObj.modules.map((mod) => {
      return {
        ...mod,
        lessons: mod.lessons.map((lesson) => {
          if (lesson.isPreview) return lesson;
          const { videoUrl, ...rest } = lesson;
          return rest;
        }),
      };
    });
    return courseObj;
  };

  // If no authenticated user, treat as guest
  if (!req.user) {
    const guestCourse = JSON.parse(JSON.stringify(course));
    hideVideosForNonPreviews(guestCourse);
    return res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: guestCourse,
    });
  }

  // Authenticated non-admin user: check enrollment
  const enrollment = await getUserEnrollment(req.user.id, courseId);

  if (!enrollment) {
    const guestCourse = JSON.parse(JSON.stringify(course));
    hideVideosForNonPreviews(guestCourse);
    return res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: guestCourse,
    });
  }

  // User is enrolled: include lesson completion info
  const lessonIds = [];
  course.modules.forEach((mod) =>
    mod.lessons.forEach((l) => lessonIds.push(l.id)),
  );

  const progresses = await getLessonProgressForUser(req.user.id, lessonIds);
  const progressMap = progresses.reduce((acc, p) => {
    acc[p.lessonId] = p;
    return acc;
  }, {});

  // Attach completion info
  const enrolledCourse = JSON.parse(JSON.stringify(course));
  enrolledCourse.modules = enrolledCourse.modules.map((mod) => ({
    ...mod,
    lessons: mod.lessons.map((lesson) => ({
      ...lesson,
      isCompleted: !!progressMap[lesson.id]?.isCompleted,
      completedAt: progressMap[lesson.id]?.completedAt ?? null,
    })),
  }));

  return res.status(200).json({
    success: true,
    message: "Course retrieved successfully",
    data: enrolledCourse,
  });
});

export const getCourses = asyncHandler(async (req, res, next) => {
  const { summary } = req.query;

  if (summary === "true" || summary === "1") {
    const courses = await getAllCoursesWithCounts();
    return res.status(200).json({
      success: true,
      message: "Courses retrieved successfully (summary view)",
      count: courses.length,
      data: courses,
    });
  }

  const courses = await getAllCourses();
  res.status(200).json({
    success: true,
    message: "Courses retrieved successfully",
    count: courses.length,
    data: courses,
  });
});

export const getCoursesofUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const enrollments = await getUserEnrolledCourses(userId);

  res.status(200).json({
    success: true,
    message: "User courses retrieved successfully",
    count: enrollments.length,
    data: enrollments,
  });
});

// STUDENT: Get current user's enrolled courses
export const getMyCourses = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const enrollments = await getUserEnrolledCourses(userId);

  res.status(200).json({
    success: true,
    message: "My courses retrieved successfully",
    count: enrollments.length,
    data: enrollments,
  });
});

// STUDENT: Get a single course (only if the current user is enrolled)
export const getMySingleCourse = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const courseId = Number(req.params.id);

  const enrollment = await getUserEnrollment(userId, courseId);

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: "Course not found or not enrolled",
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: "Course retrieved successfully",
    data: enrollment.course,
  });
});

// MODULE
export const addModule = asyncHandler(async (req, res, next) => {
  const module = await createModule(Number(req.params.courseId), req.body);
  res.status(201).json({
    success: true,
    message: "Module created successfully",
    data: module,
  });
});

export const editModule = asyncHandler(async (req, res, next) => {
  const module = await updateModule(Number(req.params.id), req.body);
  res.status(200).json({
    success: true,
    message: "Module updated successfully",
    data: module,
  });
});

export const removeModule = asyncHandler(async (req, res, next) => {
  await deleteModule(Number(req.params.id));
  res.status(200).json({
    success: true,
    message: "Module deleted successfully",
    data: null,
  });
});

// LESSON
export const addLesson = asyncHandler(async (req, res, next) => {
  const lesson = await createLesson(Number(req.params.moduleId), req.body);
  res.status(201).json({
    success: true,
    message: "Lesson created successfully",
    data: lesson,
  });
});

export const editLesson = asyncHandler(async (req, res, next) => {
  const lesson = await updateLesson(Number(req.params.id), req.body);
  res.status(200).json({
    success: true,
    message: "Lesson updated successfully",
    data: lesson,
  });
});

export const removeLesson = asyncHandler(async (req, res, next) => {
  await deleteLesson(Number(req.params.id));
  res.status(200).json({
    success: true,
    message: "Lesson deleted successfully",
    data: null,
  });
});

// LESSON PROGRESS
export const completeLessonController = asyncHandler(async (req, res, next) => {
  const { userId, lessonId } = req.body;
  const progress = await completeLesson(Number(userId), Number(lessonId));
  res.status(200).json({
    success: true,
    message: "Lesson marked as completed",
    data: progress,
  });
});
