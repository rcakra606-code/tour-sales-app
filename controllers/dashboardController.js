// controllers/dashboardController.js
const db = require("../config/database");

exports.getStats = (req, res) => {
  const stats = {};
  db.get("SELECT COUNT(*) AS totalTours FROM tours", (err, row1) => {
    if (err) return res.status(500).json({ message: "Gagal menghitung tours." });
    stats.totalTours = row1.totalTours;

    db.get("SELECT COUNT(*) AS totalSales FROM sales", (err2, row2) => {
      if (err2) return res.status(500).json({ message: "Gagal menghitung sales." });
      stats.totalSales = row2.totalSales;

      db.get("SELECT SUM(amount) AS totalRevenue FROM sales", (err3, row3) => {
        if (err3) return res.status(500).json({ message: "Gagal menghitung pendapatan." });
        stats.totalRevenue = row3.totalRevenue || 0;

        res.json(stats);
      });
    });
  });
};
