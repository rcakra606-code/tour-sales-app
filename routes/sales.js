/**
 * ==========================================================
 * routes/sales.js — Travel Dashboard Enterprise v3.9.4
 * ==========================================================
 * ✅ CRUD data sales
 * ✅ Summary per staff
 * ✅ Export Excel
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const salesController = require("../controllers/reportSalesController");
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// ============================================================
// 📘 GET /api/sales
router.get("/", verifyToken, salesController.getAllSales);

// 📘 GET /api/sales/:id
router.get("/:id", verifyToken, salesController.getSaleById);

// 🟢 POST /api/sales
router.post("/", verifyToken, roleCheck(["super", "semi"]), salesController.createSale);

// 🟡 PUT /api/sales/:id
router.put("/:id", verifyToken, roleCheck(["super", "semi"]), salesController.updateSale);

// 🔴 DELETE /api/sales/:id
router.delete("/:id", verifyToken, roleCheck(["super"]), salesController.deleteSale);

// 📊 GET /api/sales/summary/by-staff
router.get(
  "/summary/by-staff",
  verifyToken,
  roleCheck(["super", "semi"]),
  salesController.getSalesSummaryByStaff
);

// 📤 GET /api/sales/export
router.get(
  "/export",
  verifyToken,
  roleCheck(["super", "semi", "basic"]),
  salesController.exportSalesReport
);

// ✅ WAJIB ADA baris ini:
module.exports = router;
