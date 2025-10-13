const express = require("express");
const router = express.Router();
const { getSales, createSale } = require("../controllers/salesController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getSales);
router.post("/", authMiddleware, createSale);

module.exports = router;
