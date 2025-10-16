// routes/regions.js
const express = require("express");
const router = express.Router();
const regionController = require("../controllers/regionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua route butuh login
router.use(authMiddleware);

// === Get all regions ===
router.get("/", regionController.getAll);

// === Create region (Admin/Super only) ===
router.post("/", roleCheck(["super", "admin"]), regionController.create);

// === Update region (Admin/Super only) ===
router.put("/:id", roleCheck(["super", "admin"]), regionController.update);

// === Delete region (Admin/Super only) ===
router.delete("/:id", roleCheck(["super", "admin"]), regionController.remove);

module.exports = router;
