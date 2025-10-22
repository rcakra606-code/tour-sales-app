import express from "express";
import {
  authenticate,
  authorizeManagement,
} from "../middleware/authMiddleware.js";
import {
  getAllDocuments,
  getDocumentsByStaff,
  getDocumentSummary,
  exportDocumentReport,
} from "../controllers/reportDocumentController.js";

const router = express.Router();

router.get("/", authenticate, authorizeManagement, getAllDocuments);
router.get("/staff/:staff_name", authenticate, getDocumentsByStaff);
router.get("/summary", authenticate, authorizeManagement, getDocumentSummary);
router.get("/export", authenticate, authorizeManagement, exportDocumentReport);

export default router;