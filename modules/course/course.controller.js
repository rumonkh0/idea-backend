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
export const addCourse = async (req, res, next) => {
  try {
    const course = await createCourse(req.body);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

export const editCourse = async (req, res, next) => {
  try {
    const course = await updateCourse(Number(req.params.id), req.body);
    res.json(course);
  } catch (err) {
    next(err);
  }
};

export const removeCourse = async (req, res, next) => {
  try {
    await deleteCourse(Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const course = await getCourseWithModulesAndLessons(Number(req.params.id));
    res.json(course);
  } catch (err) {
    next(err);
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const courses = await getAllCourses();
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

// MODULE
export const addModule = async (req, res, next) => {
  try {
    const module = await createModule(Number(req.params.courseId), req.body);
    res.status(201).json(module);
  } catch (err) {
    next(err);
  }
};

export const editModule = async (req, res, next) => {
  try {
    const module = await updateModule(Number(req.params.id), req.body);
    res.json(module);
  } catch (err) {
    next(err);
  }
};

export const removeModule = async (req, res, next) => {
  try {
    await deleteModule(Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// LESSON
export const addLesson = async (req, res, next) => {
  try {
    const lesson = await createLesson(Number(req.params.moduleId), req.body);
    res.status(201).json(lesson);
  } catch (err) {
    next(err);
  }
};

export const editLesson = async (req, res, next) => {
  try {
    const lesson = await updateLesson(Number(req.params.id), req.body);
    res.json(lesson);
  } catch (err) {
    next(err);
  }
};

export const removeLesson = async (req, res, next) => {
  try {
    await deleteLesson(Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// LESSON PROGRESS
export const completeLessonController = async (req, res, next) => {
  try {
    const { userId, lessonId } = req.body;
    const progress = await completeLesson(Number(userId), Number(lessonId));
    res.json(progress);
  } catch (err) {
    next(err);
  }
};
