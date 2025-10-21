// ==========================================================
// 📄 Travel Dashboard Enterprise v5.3
// Documents Routes (JWT + Role-Based Access Control)
// ==========================================================
import express from "express";
import {
  getAllDocuments,
  createDocument,
  deleteDocument,
} from "../controllers/documentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleCheck } from "../middleware/roleCheck.js";

const router = express.Router();

// 📋 Get all documents
router.get("/", authMiddleware, roleCheck(["staff", "semiadmin", "admin"]), getAllDocuments);

// ➕ Create new document
router.post("/", authMiddleware, roleCheck(["staff", "semiadmin", "admin"]), createDocument);

// ❌ Delete document (admin only)
router.delete("/:id", authMiddleware, roleCheck(["admin"]), deleteDocument);

export default router;