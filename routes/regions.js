// routes/regions.js
const express = require("express");
const router = express.Router();
const regionController = require("../controllers/regionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua endpoint di bawah butuh login
router.use(authMiddleware);

// Hanya admin (type = super) yang bisa ubah region
router.get("/", regionController.getAllRegions);
router.post("/", roleCheck(["super"]), regionController.createRegion);
router.put("/:id", roleCheck(["super"]), regionController.updateRegion);
router.delete("/:id", roleCheck(["super"]), regionController.deleteRegion);

module.exports = router;
