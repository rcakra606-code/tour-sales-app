// routes/documents.js
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getDocuments,
  createDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

// Semua route documents butuh autentikasi
router.get("/", authenticate, getDocuments);
router.post("/", authenticate, createDocument);
router.delete("/:id", authenticate, deleteDocument);

export default router;