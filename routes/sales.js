// routes/sales.js — Final Version
const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");

// GET all sales (paginated)
router.get("/", salesController.getSales);

// POST create new sale
router.post("/", salesController.createSale);

// DELETE sale by ID
router.delete("/:id", salesController.deleteSale);

// GET summary for dashboard
router.get("/summary", salesController.getSalesSummary);

module.exports = router;
