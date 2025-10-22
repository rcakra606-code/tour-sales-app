import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { getAllUsers, createUser, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/", authenticate, authorizeAdmin, getAllUsers);
router.post("/", authenticate, authorizeAdmin, createUser);
router.put("/:id", authenticate, authorizeAdmin, updateUser);
router.delete("/:id", authenticate, authorizeAdmin, deleteUser);

export default router;