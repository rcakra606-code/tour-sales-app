// ==========================================================
// 💰 Travel Dashboard Enterprise v5.3
// Sales Controller (CRUD + Target + PostgreSQL Secure)
// ==========================================================
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 📊 Get All Sales
export const getAllSales = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sales ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ getAllSales error:", err.message);
    res.status(500).json({ message: "Gagal memuat data sales" });
  }
};

// ➕ Create New Sale
export const createSale = async (req, res) => {
  try {
    const { transactionDate, invoiceNumber, staffName, salesAmount, profitAmount } = req.body;

    if (!transactionDate || !invoiceNumber || !staffName)
      return res.status(400).json({ message: "Tanggal, invoice, dan nama staff wajib diisi" });

    await pool.query(
      `INSERT INTO sales (transaction_date, invoice_number, staff_name, sales_amount, profit_amount)
       VALUES ($1, $2, $3, $4, $5)`,
      [transactionDate, invoiceNumber, staffName, salesAmount || 0, profitAmount || 0]
    );

    res.status(201).json({ message: "✅ Transaksi sales berhasil disimpan" });
  } catch (err) {
    console.error("❌ createSale error:", err.message);
    res.status(500).json({ message: "Gagal menyimpan transaksi sales" });
  }
};

// ❌ Delete Sale
export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM sales WHERE id = $1", [id]);
    res.json({ message: "✅ Data sales berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteSale error:", err.message);
    res.status(500).json({ message: "Gagal menghapus data sales" });
  }
};

// 🎯 Get All Targets
export const getAllTargets = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM targets ORDER BY target_month DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ getAllTargets error:", err.message);
    res.status(500).json({ message: "Gagal memuat target bulanan" });
  }
};

// ➕ Create Target
export const createTarget = async (req, res) => {
  try {
    const { targetStaff, targetMonth, targetSales, targetProfit } = req.body;

    if (!targetStaff || !targetMonth)
      return res.status(400).json({ message: "Nama staff dan bulan target wajib diisi" });

    await pool.query(
      `INSERT INTO targets (staff_name, target_month, target_sales, target_profit)
       VALUES ($1, $2, $3, $4)`,
      [targetStaff, targetMonth, targetSales || 0, targetProfit || 0]
    );

    res.status(201).json({ message: "✅ Target bulanan berhasil disimpan" });
  } catch (err) {
    console.error("❌ createTarget error:", err.message);
    res.status(500).json({ message: "Gagal menyimpan target bulanan" });
  }
};