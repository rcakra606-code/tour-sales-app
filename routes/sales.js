const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");
const authMiddleware = require("../middleware/authMiddleware");

// Semua route sales hanya bisa diakses setelah login
router.use(authMiddleware);

// Tambahkan route
router.get("/", salesController.getAllSales);
router.post("/", salesController.createSale);
router.put("/:id", salesController.updateSale);
router.delete("/:id", salesController.deleteSale);

module.exports = router;
