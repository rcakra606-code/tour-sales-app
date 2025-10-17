/**
 * 🧭 Region Routes
 * CRUD untuk data wilayah (region)
 */
const express = require("express");
const router = express.Router();
const regionController = require("../controllers/regionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua endpoint butuh login
router.use(authMiddleware);

// === CRUD Region ===
router.get("/", regionController.getAll);
router.post("/", roleCheck(["admin"]), regionController.create);
router.put("/:id", roleCheck(["admin"]), regionController.update);
router.delete("/:id", roleCheck(["admin"]), regionController.remove);

module.exports = router;
