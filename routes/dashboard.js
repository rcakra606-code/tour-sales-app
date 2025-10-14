const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { getDashboard } = require("../controllers/dashboardController");

router.get("/", verifyToken, getDashboard);

module.exports = router;
