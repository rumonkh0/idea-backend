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
   getCoursesofUser,
   getMyCourses,
   getMySingleCourse,
} from "./course.controller.js";
import { authorize, protect } from "../../middleware/auth.js";

const router = express.Router();





/* ===========================
   STUDENT ROUTES
=========================== */

router.get("/me", protect, getMyCourses);
router.get("/:id/me", protect, getMySingleCourse);

// Lesson progress
router.post("/lesson/complete", completeLessonController);


/* ===========================
   PUBLIC ROUTES
=========================== */

router.get("/", getCourses);
router.get("/:id", getCourse);



/* ===========================
   ADMIN ROUTES
=========================== */

router.use(protect, authorize("ADMIN", "SUPERADMIN"))

// Course routes
router.post("/", addCourse);
router.put("/:id", editCourse);
router.delete("/:id", removeCourse);
router.get("/user/:userId/", getCoursesofUser);

// Module routes
router.post("/:courseId/module", addModule);
router.put("/module/:id", editModule);
router.delete("/module/:id", removeModule);

// Lesson routes
router.post("/module/:moduleId/lesson", addLesson);
router.put("/lesson/:id", editLesson);
router.delete("/lesson/:id", removeLesson);


export default router;
