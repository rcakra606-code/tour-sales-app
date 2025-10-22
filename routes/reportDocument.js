// ==========================================================
// 📑 Report Document Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/reportDocumentController.js";

const router = express.Router();

router.get("/", authenticate, getDocuments);
router.post("/", authenticate, authorize(["admin", "semiadmin", "staff"]), createDocument);
router.put("/:id", authenticate, authorize(["admin", "semiadmin"]), updateDocument);
router.delete("/:id", authenticate, authorize(["admin"]), deleteDocument);

export default router;