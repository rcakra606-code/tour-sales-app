// controllers/salesController.js — Final Production Version
const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/**
 * GET /api/sales
 * Ambil daftar sales (dengan search & pagination)
 */
exports.getSales = (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : "%%";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const totalRow = db
      .prepare(
        `SELECT COUNT(*) AS c FROM sales 
         WHERE invoiceNumber LIKE ? OR staff LIKE ?`
      )
      .get(search, search);
    const total = totalRow.c || 0;
    const totalPages = Math.ceil(total / limit);

    const sales = db
      .prepare(
        `SELECT * FROM sales 
         WHERE invoiceNumber LIKE ? OR staff LIKE ? 
         ORDER BY transactionDate DESC 
         LIMIT ? OFFSET ?`
      )
      .all(search, search, limit, offset);

    res.json({ data: sales, total, page, totalPages });
  } catch (err) {
    console.error("getSales error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data sales." });
  }
};

/**
 * POST /api/sales
 * Tambah data penjualan baru
 */
exports.createSale = (req, res) => {
  try {
    const { transactionDate, invoiceNumber, salesAmount, profitAmount, staff } = req.body;
    if (!transactionDate || !invoiceNumber)
      return res.status(400).json({ error: "Tanggal & Invoice wajib diisi." });

    db.prepare(
      `INSERT INTO sales (transactionDate, invoiceNumber, salesAmount, profitAmount, staff)
       VALUES (?, ?, ?, ?, ?)`
    ).run(
      transactionDate,
      invoiceNumber,
      salesAmount || 0,
      profitAmount || 0,
      staff || ""
    );

    res.json({ ok: true, message: "Data penjualan berhasil ditambahkan." });
  } catch (err) {
    console.error("createSale error:", err.message);
    res.status(500).json({ error: "Gagal menambah data sales." });
  }
};

/**
 * DELETE /api/sales/:id
 * Hapus data penjualan
 */
exports.deleteSale = (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID tidak diberikan." });

    db.prepare("DELETE FROM sales WHERE id = ?").run(id);
    res.json({ ok: true, message: "Data penjualan dihapus." });
  } catch (err) {
    console.error("deleteSale error:", err.message);
    res.status(500).json({ error: "Gagal menghapus data sales." });
  }
};

/**
 * GET /api/sales/summary
 * Statistik sales untuk dashboard
 */
exports.getSalesSummary = (req, res) => {
  try {
    const totalSales = db.prepare("SELECT SUM(salesAmount) AS s FROM sales").get().s || 0;
    const totalProfit = db.prepare("SELECT SUM(profitAmount) AS p FROM sales").get().p || 0;

    const staffSummary = db
      .prepare(
        `SELECT staff, SUM(salesAmount) AS totalSales, SUM(profitAmount) AS totalProfit
         FROM sales
         WHERE staff IS NOT NULL AND staff != ''
         GROUP BY staff ORDER BY totalSales DESC`
      )
      .all();

    const monthlySummary = db
      .prepare(
        `SELECT SUBSTR(transactionDate, 1, 7) AS month, 
                SUM(salesAmount) AS totalSales, 
                SUM(profitAmount) AS totalProfit
         FROM sales
         GROUP BY month ORDER BY month ASC`
      )
      .all();

    res.json({
      totalSales,
      totalProfit,
      staffSummary,
      monthlySummary
    });
  } catch (err) {
    console.error("getSalesSummary error:", err.message);
    res.status(500).json({ error: "Gagal mengambil ringkasan sales." });
  }
};
