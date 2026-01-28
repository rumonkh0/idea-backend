import asyncHandler from "../../middleware/async.js";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseWithModulesAndLessons,
  getAllCourses,
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
  res.status(201).json(course);
});

export const editCourse = asyncHandler(async (req, res, next) => {
  const course = await updateCourse(Number(req.params.id), req.body);
  res.json(course);
});

export const removeCourse = asyncHandler(async (req, res, next) => {
  await deleteCourse(Number(req.params.id));
  res.status(204).end();
});

export const getCourse = asyncHandler(async (req, res, next) => {
  const course = await getCourseWithModulesAndLessons(Number(req.params.id));
  res.json(course);
});

export const getCourses = asyncHandler(async (req, res, next) => {
  const courses = await getAllCourses();
  res.json(courses);
});

export const getCoursesofUser = asyncHandler(async (req, res, next) => {
  const courses = await getAllCourses();
  res.json(courses);
});

// MODULE
export const addModule = asyncHandler(async (req, res, next) => {
  const module = await createModule(Number(req.params.courseId), req.body);
  res.status(201).json(module);
});

export const editModule = asyncHandler(async (req, res, next) => {
  const module = await updateModule(Number(req.params.id), req.body);
  res.json(module);
});

export const removeModule = asyncHandler(async (req, res, next) => {
  await deleteModule(Number(req.params.id));
  res.status(204).end();
});

// LESSON
export const addLesson = asyncHandler(async (req, res, next) => {
  const lesson = await createLesson(Number(req.params.moduleId), req.body);
  res.status(201).json(lesson);
});

export const editLesson = asyncHandler(async (req, res, next) => {
  const lesson = await updateLesson(Number(req.params.id), req.body);
  res.json(lesson);
});

export const removeLesson = asyncHandler(async (req, res, next) => {
  await deleteLesson(Number(req.params.id));
  res.status(204).end();
});

// LESSON PROGRESS
export const completeLessonController = asyncHandler(async (req, res, next) => {
  const { userId, lessonId } = req.body;
  const progress = await completeLesson(Number(userId), Number(lessonId));
  res.json(progress);
});
