import express from "express";
import { getAllSales, addSales, deleteSales } from "../controllers/reportSalesController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, getAllSales);
router.post("/", authenticate, addSales);
router.delete("/:id", authenticate, deleteSales);

export default router;