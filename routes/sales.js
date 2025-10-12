// =====================================
// ✅ Sales Routes
// =====================================
const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middleware/auth");
const controller = require("../controllers/salesController");

if (!controller?.getAll) {
  console.error("❌ salesController tidak lengkap atau tidak ditemukan");
}

// Semua route butuh token
router.use(authenticateToken);

// Staff & admin bisa lihat
router.get("/", controller.getAll);

// Admin-only: tambah, ubah, hapus
router.post("/", requireRole("admin"), controller.create);
router.put("/:id", requireRole("admin"), controller.update);
router.delete("/:id", requireRole("admin"), controller.remove);

module.exports = router;
