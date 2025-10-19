/**
 * ==========================================================
 * controllers/reportSalesController.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ CRUD data sales
 * ✅ Filter berdasarkan staff_name (?staff=nama)
 * ✅ Summary penjualan per staff (untuk executive dashboard)
 * ✅ Export Excel (XLSX)
 * ✅ Integrasi logger & keamanan
 * ==========================================================
 */

const db = require("../config/database");
const logger = require("../config/logger");
const ExcelJS = require("exceljs");

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
    res.status(500).json({ message: "Gagal menambah data sales" });
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

    logger.info(`✏️ Sales ID ${id} diperbarui oleh ${staff_name || "unknown"}`);
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

// ============================================================
// 📤 GET /api/sales/export
// Export data sales ke Excel
// ============================================================
exports.exportSalesReport = async (req, res) => {
  try {
    const filename = `Sales_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Data");

    const data = await db.all("SELECT * FROM sales ORDER BY transaction_date DESC");

    worksheet.columns = [
      { header: "Tanggal Transaksi", key: "transaction_date", width: 18 },
      { header: "Invoice Number", key: "invoice_number", width: 20 },
      { header: "Nama Staff", key: "staff_name", width: 20 },
      { header: "Sales Amount", key: "sales_amount", width: 15 },
      { header: "Profit Amount", key: "profit_amount", width: 15 },
      { header: "Discount Amount", key: "discount_amount", width: 15 },
    ];

    data.forEach((row) => worksheet.addRow(row));
    worksheet.getRow(1).font = { bold: true };

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    await workbook.xlsx.write(res);
    res.end();

    logger.info(`📁 Exported Sales Report: ${filename}`);
  } catch (err) {
    logger.error("❌ Error exporting sales report:", err);
    res.status(500).json({ message: "Gagal mengekspor data sales" });
  }
};
