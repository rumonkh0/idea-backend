import express from "express";
import { createUser, getUsers, getUserById, updateUser, deleteUser, getUserByEmail} from "./user.controller.js";
import { authorize, protect } from "../../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("ADMIN", "SUPERADMIN")); // All routes below are protected and require admin/superadmin role
router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.get("/email/:email", getUserByEmail);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);


export default router;
