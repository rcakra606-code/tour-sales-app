const db = require("../config/database");

exports.summary = (req, res) => {
  const totalTours = db.prepare("SELECT COUNT(*) as count FROM tours").get().count;
  const totalSales = db.prepare("SELECT COUNT(*) as count FROM sales").get().count;
  res.json({ success: true, summary: { totalTours, totalSales } });
};

exports.charts = (req, res) => {
  const tours = db.prepare("SELECT title, price FROM tours").all();
  const sales = db.prepare("SELECT tourId, SUM(amount) as total FROM sales GROUP BY tourId").all();
  res.json({ success: true, charts: { tours, sales } });
};
