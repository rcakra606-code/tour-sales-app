// routes/dashboard.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboardController");

router.get("/executive", controller.getExecutiveSummary);

module.exports = router;/**
 * routes/dashboard.js
 * FINAL BUILD (v2025.10)
 * ----------------------------------------------
 * Mengatur semua endpoint dashboard & notifikasi.
 * Terintegrasi dengan role-based access (middleware auth.js)
 */

const express = require("express");
const router = express.Router();
const { getDB } = require("../db"); // helper koneksi sqlite
const authMiddleware = require("../middleware/auth"); // JWT verify middleware

// 🔐 Semua route di bawah ini wajib login
router.use(authMiddleware);

/* =====================================================
   GET /api/dashboard/summary
   Ringkasan data untuk dashboard utama (Tour & Sales)
   ===================================================== */
router.get("/summary", async (req, res) => {
  try {
    const db = getDB();

    const totalSales = db.prepare("SELECT IFNULL(SUM(sales_amount),0) AS total FROM sales").get().total;
    const totalProfit = db.prepare("SELECT IFNULL(SUM(profit_amount),0) AS total FROM sales").get().total;
    const totalRegistrants = db.prepare("SELECT COUNT(*) AS total FROM tours").get().total;
    const totalPax = db.prepare("SELECT IFNULL(SUM(pax_count),0) AS total FROM tours").get().total;

    const regions = db.prepare("SELECT region AS name, COUNT(*) AS count FROM tours GROUP BY region").all();

    res.json({
      totalSales,
      totalProfit,
      totalRegistrants,
      totalPax,
      regions
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   GET /api/dashboard/notifications
   Notifikasi realtime untuk header 🔔
   ===================================================== */
router.get("/notifications", async (req, res) => {
  try {
    const db = getDB();

    // Cek event baru dalam 24 jam terakhir
    const newTours = db.prepare(`
      SELECT COUNT(*) AS c FROM tours 
      WHERE datetime(created_at) >= datetime('now', '-1 day')
    `).get().c;

    const newSales = db.prepare(`
      SELECT COUNT(*) AS c FROM sales 
      WHERE datetime(created_at) >= datetime('now', '-1 day')
    `).get().c;

    const newDocs = db.prepare(`
      SELECT COUNT(*) AS c FROM documents 
      WHERE datetime(created_at) >= datetime('now', '-1 day')
    `).get().c;

    res.json({
      total: newTours + newSales + newDocs,
      tours: newTours,
      sales: newSales,
      documents: newDocs
    });
  } catch (err) {
    console.error("Notif error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   GET /api/dashboard/executive
   Executive summary untuk grafik manajerial
   ===================================================== */
router.get("/executive", async (req, res) => {
  try {
    const db = getDB();

    // Top staff berdasarkan total sales
    const topStaff = db.prepare(`
      SELECT s.staff_username AS username,
             SUM(s.sales_amount) AS sales,
             SUM(s.profit_amount) AS profit
      FROM sales s
      GROUP BY s.staff_username
      ORDER BY sales DESC
      LIMIT 10
    `).all();

    // Total per bulan
    const monthlySales = db.prepare(`
      SELECT substr(transaction_date,1,7) AS month,
             SUM(sales_amount) AS totalSales,
             SUM(profit_amount) AS totalProfit
      FROM sales
      GROUP BY substr(transaction_date,1,7)
      ORDER BY month DESC
      LIMIT 12
    `).all();

    res.json({
      topStaff,
      monthlySales
    });
  } catch (err) {
    console.error("Executive report error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   Middleware tambahan: role guard (optional)
   Untuk batasi endpoint khusus super/semi
   ===================================================== */
function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.user; // dari middleware auth.js
    if (!user || !roles.includes(user.type)) {
      return res.status(403).json({ error: "Akses ditolak (tidak memiliki hak akses)." });
    }
    next();
  };
}

/* =====================================================
   Contoh: endpoint khusus admin (super saja)
   ===================================================== */
router.get("/admin/overview", requireRole("super"), async (req, res) => {
  try {
    const db = getDB();
    const users = db.prepare("SELECT username, name, type FROM users ORDER BY username").all();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

