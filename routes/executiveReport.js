const express = require("express");
const router = express.Router();
const execController = require("../controllers/executiveReportController");
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// 🔹 Ambil summary laporan eksekutif
router.get("/summary", verifyToken, roleCheck(["super", "semi"]), execController.getExecutiveSummary);

// 🔹 Export laporan eksekutif ke Excel
router.get("/export", verifyToken, roleCheck(["super", "semi"]), execController.exportExecutiveReport);

// 🔹 Hapus cache laporan
router.delete("/cache", verifyToken, roleCheck(["super"]), execController.clearExecutiveCache);

// 🔹 Cek status cache
router.get("/cache/status", verifyToken, roleCheck(["super", "semi"]), execController.getCacheStatus);

module.exports = router;
