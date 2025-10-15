// routes/sales.js
const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");
const roleCheck = require("../middleware/roleCheck");

// 🔹 Semua user bisa lihat sales list
router.get("/", salesController.getAllSales);

// 🔹 Hanya super dan semi yang bisa menambah atau mengubah data sales
router.post("/", roleCheck("super", "semi"), salesController.createSale);
router.put("/:id", roleCheck("super", "semi"), salesController.updateSale);
router.delete("/:id", roleCheck("super"), salesController.deleteSale);

module.exports = router;
