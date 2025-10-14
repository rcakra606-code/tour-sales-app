const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { getAllSales, createSale } = require("../controllers/salesController");

router.get("/", verifyToken, getAllSales);
router.post("/", verifyToken, createSale);

module.exports = router;
