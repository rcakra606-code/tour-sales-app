// ==========================================================
// 🧾 Log Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { addLog, getLogs, deleteLog } from "../controllers/logController.js";

const router = express.Router();

// Hanya admin & semiadmin yang boleh melihat log
router.get("/", authenticate, authorize(["admin", "semiadmin"]), getLogs);

// Semua user boleh mencatat log (misalnya saat input data)
router.post("/", authenticate, addLog);

// Hanya admin boleh hapus log
router.delete("/:id", authenticate, authorize(["admin"]), deleteLog);

export default router;