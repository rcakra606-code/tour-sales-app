/**
 * ==========================================================
 * controllers/reportSalesController.js — Travel Dashboard Enterprise v3.7.2
 * ==========================================================
 * ✅ CRUD data sales
 * ✅ Filter berdasarkan nama staff (?staff=nama)
 * ✅ Ringkasan total transaksi, sales & profit per staff
 * ✅ Terintegrasi middleware auth dan logger
 * ==========================================================
 */

const db = require("../config/database");
const logger = require("../config/logger");

// ============================================================
// 📘 GET /api/sales
// Ambil semua data sales (+ optional filter staff_name)
// ============================================================
exports.getAllSales = async (req, res) => {
  try {
    const { staff } = req.query;
    let query = "SELECT * FROM sales";
    const params = [];

    if (staff) {
      query += " WHERE LOWER(staff_name) LIKE ?";
      params.push(`%${staff.toLowerCase()}%`);
    }

    const result = await db.all(query, params);
    res.json(result);
  } catch (err) {
    logger.error("❌ Error fetching sales data:", err);
    res.status(500).json({ message: "Gagal mengambil data sales" });
  }
};

// ============================================================
// 📘 GET /api/sales/:id
// Ambil 1 data sales berdasarkan ID
// ============================================================
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await db.get("SELECT * FROM sales WHERE id = ?", [id]);

    if (!sale) {
      return res.status(404).json({ message: "Data sales tidak ditemukan" });
    }

    res.json(sale);
  } catch (err) {
    logger.error("❌ Error fetching sale by ID:", err);
    res.status(500).json({ message: "Gagal mengambil data sales" });
  }
};

// ============================================================
// 🟢 POST /api/sales
// Tambah data sales baru
// ============================================================
exports.createSale = async (req, res) => {
  try {
    const {
      transaction_date,
      invoice_number,
      staff_name,
      sales_amount,
      profit_amount,
      discount_amount,
    } = req.body;

    if (!transaction_date || !invoice_number || !staff_name) {
      return res.status(400).json({ message: "Harap isi semua field wajib" });
    }

    await db.run(
      `
      INSERT INTO sales (transaction_date, invoice_number, staff_name, sales_amount, profit_amount, discount_amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        transaction_date,
        invoice_number,
        staff_name,
        sales_amount || 0,
        profit_amount || 0,
        discount_amount || 0,
      ]
    );

    logger.info(`✅ Sales ditambahkan oleh ${staff_name}`);
    res.json({ message: "✅ Data sales berhasil ditambahkan" });
  } catch (err) {
    logger.error("❌ Error creating sale:", err);
    res.status(500).json({ message: "Gagal menambahkan data sales" });
  }
};

// ============================================================
// 🟡 PUT /api/sales/:id
// Update data sales
// ============================================================
exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      transaction_date,
      invoice_number,
      staff_name,
      sales_amount,
      profit_amount,
      discount_amount,
    } = req.body;

    const existing = await db.get("SELECT id FROM sales WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: "Data sales tidak ditemukan" });
    }

    await db.run(
      `
      UPDATE sales 
      SET transaction_date = ?, 
          invoice_number = ?, 
          staff_name = ?, 
          sales_amount = ?, 
          profit_amount = ?, 
          discount_amount = ?
      WHERE id = ?
    `,
      [
        transaction_date,
        invoice_number,
        staff_name,
        sales_amount || 0,
        profit_amount || 0,
        discount_amount || 0,
        id,
      ]
    );

    logger.info(`✏️ Sales ID ${id} diperbarui oleh ${staff_name}`);
    res.json({ message: "✅ Data sales berhasil diperbarui" });
  } catch (err) {
    logger.error("❌ Error updating sale:", err);
    res.status(500).json({ message: "Gagal memperbarui data sales" });
  }
};

// ============================================================
// 🔴 DELETE /api/sales/:id
// Hapus data sales
// ============================================================
exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.get("SELECT id FROM sales WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: "Data sales tidak ditemukan" });
    }

    await db.run("DELETE FROM sales WHERE id = ?", [id]);

    logger.info(`🗑️ Sales ID ${id} dihapus`);
    res.json({ message: "✅ Data sales berhasil dihapus" });
  } catch (err) {
    logger.error("❌ Error deleting sale:", err);
    res.status(500).json({ message: "Gagal menghapus data sales" });
  }
};

// ============================================================
// 📊 GET /api/sales/summary/by-staff
// Ringkasan total transaksi, sales & profit per staff
// ============================================================
exports.getSalesSummaryByStaff = async (req, res) => {
  try {
    const summary = await db.all(`
      SELECT 
        staff_name,
        COUNT(id) AS total_transactions,
        SUM(sales_amount) AS total_sales,
        SUM(profit_amount) AS total_profit
      FROM sales
      WHERE staff_name IS NOT NULL AND TRIM(staff_name) != ''
      GROUP BY staff_name
      ORDER BY total_sales DESC
    `);

    res.json({ summary });
  } catch (err) {
    logger.error("❌ Error fetching sales summary per staff:", err);
    res.status(500).json({ message: "Gagal mengambil ringkasan penjualan per staff" });
  }
};
