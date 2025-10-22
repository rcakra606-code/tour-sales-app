// ==========================================================
// 💰 Sales Management Routes — v5.4.6
// ==========================================================
import express from "express";
import {
  authenticate,
  authorizeManagement,
} from "../middleware/authMiddleware.js";
import {
  createSale,
  updateSale,
  deleteSale,
  getSales,
} from "../controllers/salesController.js";

const router = express.Router();

router.get("/", authenticate, getSales);
router.post("/", authenticate, authorizeManagement, createSale);
router.put("/:id", authenticate, authorizeManagement, updateSale);
router.delete("/:id", authenticate, authorizeManagement, deleteSale);

export default router;