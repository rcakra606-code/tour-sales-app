// ==========================================================
// 📑 Document Report Routes — v5.4.6
// ==========================================================
import express from "express";
import {
  authenticate,
  authorizeManagement,
} from "../middleware/authMiddleware.js";
import {
  getAllDocuments,
  getDocumentsByStaff,
  exportDocumentReport,
} from "../controllers/reportDocumentController.js";

const router = express.Router();

router.get("/", authenticate, authorizeManagement, getAllDocuments);
router.get("/staff/:staff_name", authenticate, getDocumentsByStaff);
router.get("/export", authenticate, authorizeManagement, exportDocumentReport);

export default router;