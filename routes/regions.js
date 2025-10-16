// routes/regions.js
const express = require("express");
const router = express.Router();
const regionsController = require("../controllers/regionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua endpoint di bawah butuh login
router.use(authMiddleware);

// Hanya admin (type = super) yang bisa ubah region
router.get("/", regionsController.getAllRegions);
router.post("/", roleCheck(["super"]), regionsController.createRegion);
router.put("/:id", roleCheck(["super"]), regionsController.updateRegion);
router.delete("/:id", roleCheck(["super"]), regionsController.deleteRegion);

module.exports = router;
