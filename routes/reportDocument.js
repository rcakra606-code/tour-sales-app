import express from "express";
import { getAllDocuments, addDocument, deleteDocument } from "../controllers/reportDocumentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, getAllDocuments);
router.post("/", authenticate, addDocument);
router.delete("/:id", authenticate, deleteDocument);

export default router;