// ==========================================================
// 📁 Document Management Routes — v5.4.6
// ==========================================================
import express from "express";
import {
  authenticate,
  authorizeManagement,
} from "../middleware/authMiddleware.js";
import {
  createDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
} from "../controllers/documentController.js";

const router = express.Router();

router.get("/", authenticate, getDocuments);
router.post("/", authenticate, authorizeManagement, createDocument);
router.put("/:id", authenticate, authorizeManagement, updateDocument);
router.delete("/:id", authenticate, authorizeManagement, deleteDocument);

export default router;