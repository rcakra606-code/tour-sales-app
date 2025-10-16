// routes/sales.js
const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", salesController.getAllSales);
router.post("/", salesController.createSale);

module.exports = router;
