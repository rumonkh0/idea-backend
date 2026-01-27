import express from "express";
import {
  addCourse,
  editCourse,
  removeCourse,
  getCourse,
  getCourses,
  addModule,
  editModule,
  removeModule,
  addLesson,
  editLesson,
  removeLesson,
  completeLessonController,
} from "./course.controller.js";

const router = express.Router();

// Course routes
router.post("/", addCourse);
router.put("/:id", editCourse);
router.delete("/:id", removeCourse);
router.get("/:id", getCourse);
router.get("/", getCourses);
router.get("/user/:userId/", getCourses);

// Module routes
router.post("/:courseId/module", addModule);
router.put("/module/:id", editModule);
router.delete("/module/:id", removeModule);

// Lesson routes
router.post("/module/:moduleId/lesson", addLesson);
router.put("/lesson/:id", editLesson);
router.delete("/lesson/:id", removeLesson);

// Lesson progress
router.post("/lesson/complete", completeLessonController);

export default router;
