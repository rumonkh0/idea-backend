import asyncHandler from "../../middleware/async.js";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseWithModulesAndLessons,
  getAllCourses,
  getAllCoursesWithCounts,
  getUserEnrolledCourses,
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
  const course = await getCourseWithModulesAndLessons(Number(req.params.id));
  res.status(200).json({
    success: true,
    message: "Course retrieved successfully",
    data: course,
  });
});

export const getCourses = asyncHandler(async (req, res, next) => {
  const { summary } = req.query;

  if (summary === "true" || summary === "1") {
    const courses = await getAllCoursesWithCounts();
    return res.status(200).json({
      success: true,
      message: "Courses retrieved successfully (summary view)",
      data: courses,
    });
  }

  const courses = await getAllCourses();
  res.status(200).json({
    success: true,
    message: "Courses retrieved successfully",
    data: courses,
  });
});

export const getCoursesofUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const enrollments = await getUserEnrolledCourses(userId);
  res.status(200).json({
    success: true,
    message: "User courses retrieved successfully",
    data: enrollments,
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
