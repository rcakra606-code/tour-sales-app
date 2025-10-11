// =====================================
// ✅ Sales Routes
// =====================================
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const salesController = require("../controllers/salesController");

router.use(authenticateToken);
router.get("/", salesController.getAllSales);
router.post("/", salesController.createSales);

module.exports = router;
