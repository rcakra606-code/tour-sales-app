const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua route sales memerlukan autentikasi
router.use(authMiddleware);

// CRUD Sales
router.get("/", salesController.getAllSales);
router.post("/", roleCheck("admin"), salesController.createSale); // Hanya admin bisa input
router.get("/:id", salesController.getSaleById);
router.put("/:id", roleCheck("admin"), salesController.updateSale); // Hanya admin
router.delete("/:id", roleCheck("admin"), salesController.deleteSale);

module.exports = router;
