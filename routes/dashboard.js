const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const db = require("../config/db");

// === Dashboard Summary ===
router.get("/", authenticateToken, async (req, res) => {
  try {
    const totalTours = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) AS count FROM tours", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const totalSales = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) AS count FROM sales", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const totalRevenue = await new Promise((resolve, reject) => {
      db.get("SELECT SUM(amount) AS total FROM sales", (err, row) => {
        if (err) reject(err);
        else resolve(row.total || 0);
      });
    });

    res.json({
      success: true,
      data: { totalTours, totalSales, totalRevenue },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
