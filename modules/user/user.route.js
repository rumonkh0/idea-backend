import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserByEmail,
} from "./user.controller.js";
import { authorize, protect } from "../../middleware/auth.js";
import avatarUpload from "../../middleware/avatarUpload.js";
import imageProcess from "../../middleware/imageProcess.js";

const router = express.Router();

router.use(protect, authorize("ADMIN", "SUPERADMIN")); // All routes below are protected and require admin/superadmin role
router.post("/", avatarUpload.single("avatar"), imageProcess, createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.get("/email/:email", getUserByEmail);
router.put("/:id", avatarUpload.single("avatar"), imageProcess, updateUser);
router.delete("/:id", deleteUser);

export default router;
