// routes/regions.js
const express = require("express");
const router = express.Router();
const regionsController = require("../controllers/regionsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua route region butuh login
router.use(authMiddleware);

// === GET semua region ===
router.get("/", regionsController.getAllRegions);

// === Tambah region baru (khusus super/semi admin) ===
router.post("/", roleCheck("super", "semi"), regionsController.addRegion);

// === Update region (super/semi) ===
router.put("/:id", roleCheck("super", "semi"), regionsController.updateRegion);

// === Hapus region (super only) ===
router.delete("/:id", roleCheck("super"), regionsController.deleteRegion);

module.exports = router;
