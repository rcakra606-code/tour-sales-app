/**
 * ==========================================================
 * routes/regions.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ CRUD data Region
 * ✅ Pencarian region untuk form Tour
 * ✅ Middleware Auth & Role
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const regionController = require("../controllers/regionController");
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// ============================================================
// 📘 GET /api/regions
// Ambil semua region (dengan opsi pencarian ?q=keyword)
// ============================================================
router.get("/", verifyToken, regionController.getAllRegions);

// ============================================================
// 🟢 POST /api/regions
// Tambah region baru (super dan semi saja)
// ============================================================
router.post("/", verifyToken, roleCheck(["super", "semi"]), regionController.createRegion);

// ============================================================
// 🟡 PUT /api/regions/:id
// Update data region
// ============================================================
router.put("/:id", verifyToken, roleCheck(["super", "semi"]), regionController.updateRegion);

// ============================================================
// 🔴 DELETE /api/regions/:id
// Hapus region
// ============================================================
router.delete("/:id", verifyToken, roleCheck(["super"]), regionController.deleteRegion);

module.exports = router;
