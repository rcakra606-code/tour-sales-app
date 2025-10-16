// routes/regions.js
const express = require("express");
const router = express.Router();
const regionsController = require("../controllers/regionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua route region butuh login
router.use(authMiddleware);

// === GET semua region (semua role bisa lihat)
router.get("/", regionsController.getAll);

// === CREATE / UPDATE / DELETE hanya untuk admin/super
router.post("/", roleCheck(["admin", "super"]), regionsController.create);
router.put("/:id", roleCheck(["admin", "super"]), regionsController.update);
router.delete("/:id", roleCheck(["admin", "super"]), regionsController.remove);

module.exports = router;
