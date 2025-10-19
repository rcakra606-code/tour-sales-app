/**
 * ==========================================================
 * controllers/reportSalesController.js
 * ==========================================================
 * ✅ CRUD data sales
 * ✅ Tambahan field staff_name
 * ✅ Filter data berdasarkan staff_name
 * ✅ Summary total per staff (opsional untuk dashboard executive)
 * ==========================================================
 */

const db = require("../config/database");
const logger = require("../config/logger");

// ===============================
// Ambil semua data sales (+ filter staff optional)
// ===============================
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
    logger.error("Error fetching sales data:", err);
    res.status(500).json({ message: "Gagal mengambil data sales" });
  }
};

// ===============================
// Ambil 1 data sales by ID
// ===============================
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.get("SELECT * FROM sales WHERE id = ?", [id]);
    if (!result) return res.status(404).json({ message: "Data tidak ditemukan" });
    res.json(result);
  } catch (err) {
    logger.error("Error fetching sale by ID:", err);
    res.status(500).json({ message: "Gagal mengambil data sales" });
  }
};

// ===============================
// Tambah data sales
// ===============================
exports.createSale = async (req, res) => {
  try {
    const { transaction_date, invoice_number, staff_name, sales_amount, profit_amount, discount_amount } = req.body;

    await db.run(
      `INSERT INTO sales (transaction_date, invoice_number, staff_name, sales_amount, profit_amount, discount_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [transaction_date, invoice_number, staff_name, sales_amount, profit_amount, discount_amount]
    );

    logger.info(`Sales created by ${staff_name || "unknown"}`);
    res.json({ message: "✅ Data sales berhasil ditambahkan" });
  } catch (err) {
    logger.error("Error creating sale:", err);
    res.status(500).json({ message: "Gagal menambah data sales" });
  }
};

// ===============================
// Update data sales
// ===============================
exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_date, invoice_number, staff_name, sales_amount, profit_amount, discount_amount } = req.body;

    await db.run(
      `UPDATE sales SET transaction_date=?, invoice_number=?, staff_name=?, sales_amount=?, profit_amount=?, discount_amount=? WHERE id=?`,
      [transaction_date, invoice_number, staff_name, sales_amount, profit_amount, discount_amount, id]
    );

    logger.info(`Sales ID ${id} updated by ${staff_name || "unknown"}`);
    res.json({ message: "✅ Data sales berhasil diperbarui" });
  } catch (err) {
    logger.error("Error updating sale:", err);
    res.status(500).json({ message: "Gagal memperbarui data sales" });
  }
};

// ===============================
// Hapus data sales
// ===============================
exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    await db.run("DELETE FROM sales WHERE id = ?", [id]);
    logger.info(`Sales ID ${id} deleted`);
    res.json({ message: "🗑️ Data sales berhasil dihapus" });
  } catch (err) {
    logger.error("Error deleting sale:", err);
    res.status(500).json({ message: "Gagal menghapus data sales" });
  }
};

// ===============================
// Summary sales per staff (for executive dashboard)
// ===============================
exports.getSalesSummaryByStaff = async (req, res) => {
  try {
    const result = await db.all(`
      SELECT 
        staff_name,
        COUNT(id) AS total_transactions,
        SUM(sales_amount) AS total_sales,
        SUM(profit_amount) AS total_profit
      FROM sales
      GROUP BY staff_name
      ORDER BY total_sales DESC
    `);

    res.json({ summary: result });
  } catch (err) {
    logger.error("Error fetching sales summary per staff:", err);
    res.status(500).json({ message: "Gagal mengambil ringkasan per staff" });
  }
};
