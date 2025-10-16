// routes/sales.js
const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua endpoint sales butuh autentikasi
router.use(authMiddleware);

// === GET semua data sales ===
router.get("/", salesController.getAllSales);

// === Tambah data sales (khusus super/semi admin) ===
router.post("/", roleCheck("super", "semi"), salesController.addSale);

// === GET satu data sales ===
router.get("/:id", salesController.getSaleById);

// === Update data sales (super/semi admin) ===
router.put("/:id", roleCheck("super", "semi"), salesController.updateSale);

// === Hapus data sales (khusus super admin) ===
router.delete("/:id", roleCheck("super"), salesController.deleteSale);

module.exports = router;
