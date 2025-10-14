const db = require("../config/database");

exports.getDashboard = (req, res) => {
  db.get(
    `SELECT 
      (SELECT COUNT(*) FROM tours) as totalTours,
      (SELECT COUNT(*) FROM sales) as totalSales,
      (SELECT SUM(amount) FROM sales) as totalRevenue`,
    [],
    (err, row) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(row);
    }
  );
};
