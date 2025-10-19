/**
 * ==========================================================
 * routes/targets.js
 * Travel Dashboard Enterprise — Target Bulanan per User
 * ==========================================================
 * ✅ CRUD targets per user per bulan
 * ✅ Summary untuk dashboard (target vs realisasi)
 * ✅ Role-based access dengan JWT verify
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const targetController = require("../controllers/targetController");
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// ============================================================
// 📘 GET /api/targets
// Ambil semua target, bisa difilter by staff/month/year
// Roles: super, semi, basic (read-only)
// ============================================================
router.get("/", verifyToken, roleCheck(["super", "semi", "basic"]), targetController.getTargets);

// ============================================================
// 🟢 POST /api/targets
// Tambah atau update target berdasarkan staff_name + month + year
// Roles: super, semi (semi hanya boleh untuk dirinya sendiri)
// ============================================================
router.post("/", verifyToken, roleCheck(["super", "semi"]), targetController.createOrUpdateTarget);

// ============================================================
// 🟡 PUT /api/targets/:id
// Update target by ID
// Roles: super, semi (semi hanya boleh ubah target-nya sendiri)
// ============================================================
router.put("/:id", verifyToken, roleCheck(["super", "semi"]), targetController.updateTarget);

// ============================================================
// 🔴 DELETE /api/targets/:id
// Hapus target
// Roles: super only
// ============================================================
router.delete("/:id", verifyToken, roleCheck(["super"]), targetController.deleteTarget);

// ============================================================
// 📊 GET /api/targets/summary
// Ambil data target vs realisasi untuk dashboard
// Roles: super, semi, basic
// ============================================================
router.get("/summary", verifyToken, roleCheck(["super", "semi", "basic"]), targetController.getTargetsSummary);

module.exports = router;
