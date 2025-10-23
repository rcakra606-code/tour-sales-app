import express from "express";
import { getDocuments, createDocument, deleteDocument } from "../controllers/documentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", authenticate, getDocuments);
router.post("/", authenticate, createDocument);
router.delete("/:id", authenticate, deleteDocument);
export default router;