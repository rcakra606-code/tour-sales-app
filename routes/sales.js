// routes/sales.js
const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");
const authMiddleware = require("../middleware/authMiddleware");

// Proteksi semua route pakai JWT
router.use(authMiddleware);

router.get("/", salesController.getAllSales);
router.get("/:id", salesController.getSaleById);
router.post("/", salesController.createSale);
router.put("/:id", salesController.updateSale);
router.delete("/:id", salesController.deleteSale);

module.exports = router;
