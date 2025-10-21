import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getUsers, createUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();
router.get("/", authenticate, getUsers);
router.post("/", authenticate, createUser);
router.delete("/:id", authenticate, deleteUser);
export default router;