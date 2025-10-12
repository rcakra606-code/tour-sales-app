// =====================================
// ✅ Tours Routes
// =====================================
const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middleware/auth");
const controller = require("../controllers/tourController");

if (!controller?.getAll) {
  console.error("❌ tourController tidak lengkap atau tidak ditemukan");
}

// Semua endpoint butuh login
router.use(authenticateToken);

// Public (staff & admin bisa akses)
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Admin only
router.post("/", requireRole("admin"), controller.create);
router.put("/:id", requireRole("admin"), controller.update);
router.delete("/:id", requireRole("admin"), controller.remove);

module.exports = router;
