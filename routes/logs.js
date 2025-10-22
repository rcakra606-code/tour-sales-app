// ==========================================================
// 🧾 Audit Log Routes — v5.4.6
// ==========================================================
import express from "express";
import {
  authenticate,
  authorizeAdmin,
} from "../middleware/authMiddleware.js";
import { getAllLogs } from "../controllers/logController.js";

const router = express.Router();

router.get("/", authenticate, authorizeAdmin, getAllLogs);

export default router;