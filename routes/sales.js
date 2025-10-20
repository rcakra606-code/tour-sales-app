// ==========================================================
// 💰 Travel Dashboard Enterprise v5.1
// Sales Routes (CRUD + Target Management)
// ==========================================================

import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 1️⃣ GET — Ambil data sales (opsional filter/search)
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const { search = "", month = "" } = req.query;
    const params = [];
    let query = `
      SELECT * FROM sales
      WHERE 1=1
    `;

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (staff_name ILIKE $${params.length} OR invoice_number ILIKE $${params.length})`;
    }

    if (month) {
      params.push(`${month}-01`);
      query += ` AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', $${params.length}::date)`;
    }

    query += " ORDER BY transaction_date DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET sales error:", err.message);
    res.status(500).json({ message: "Gagal memuat data sales" });
  }
});

// ==========================================================
// 2️⃣ POST — Tambah data sales
// ==========================================================
router.post("/", async (req, res) => {
  try {
    const { transactionDate, invoiceNumber, staffName, salesAmount, profitAmount } = req.body;

    const result = await pool.query(
      `
      INSERT INTO sales (
        transaction_date, invoice_number, staff_name, sales_amount, profit_amount
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [transactionDate, invoiceNumber, staffName, salesAmount, profitAmount]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ POST sales error:", err.message);
    res.status(500).json({ message: "Gagal menambahkan data sales" });
  }
});

// ==========================================================
// 3️⃣ PUT — Update data sales
// ==========================================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionDate, invoiceNumber, staffName, salesAmount, profitAmount } = req.body;

    const result = await pool.query(
      `
      UPDATE sales SET
        transaction_date=$1,
        invoice_number=$2,
        staff_name=$3,
        sales_amount=$4,
        profit_amount=$5
      WHERE id=$6
      RETURNING *;
      `,
      [transactionDate, invoiceNumber, staffName, salesAmount, profitAmount, id]
    );

    if (!result.rows.length) return res.status(404).json({ message: "Data sales tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ PUT sales error:", err.message);
    res.status(500).json({ message: "Gagal memperbarui data sales" });
  }
});

// ==========================================================
// 4️⃣ DELETE — Hapus data sales
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM sales WHERE id=$1 RETURNING *", [id]);

    if (!result.rows.length) return res.status(404).json({ message: "Data sales tidak ditemukan" });
    res.json({ message: "Data sales berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE sales error:", err.message);
    res.status(500).json({ message: "Gagal menghapus data sales" });
  }
});

// ==========================================================
// 5️⃣ GET — Ambil semua target sales (opsional filter staff/bulan)
// ==========================================================
router.get("/targets", async (req, res) => {
  try {
    const { staff = "", month = "" } = req.query;
    const params = [];
    let query = `
      SELECT * FROM targets
      WHERE 1=1
    `;

    if (staff) {
      params.push(`%${staff}%`);
      query += ` AND staff_name ILIKE $${params.length}`;
    }

    if (month) {
      params.push(`${month}-01`);
      query += ` AND DATE_TRUNC('month', target_month) = DATE_TRUNC('month', $${params.length}::date)`;
    }

    query += " ORDER BY target_month DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET targets error:", err.message);
    res.status(500).json({ message: "Gagal memuat data target" });
  }
});

// ==========================================================
// 6️⃣ POST — Tambah target baru
// ==========================================================
router.post("/targets", async (req, res) => {
  try {
    const { targetStaff, targetMonth, targetSales, targetProfit } = req.body;

    const result = await pool.query(
      `
      INSERT INTO targets (staff_name, target_month, target_sales, target_profit)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [targetStaff, targetMonth, targetSales, targetProfit]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ POST target error:", err.message);
    res.status(500).json({ message: "Gagal menambahkan data target" });
  }
});

// ==========================================================
// 7️⃣ PUT — Update target
// ==========================================================
router.put("/targets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { targetStaff, targetMonth, targetSales, targetProfit } = req.body;

    const result = await pool.query(
      `
      UPDATE targets SET
        staff_name=$1,
        target_month=$2,
        target_sales=$3,
        target_profit=$4
      WHERE id=$5
      RETURNING *;
      `,
      [targetStaff, targetMonth, targetSales, targetProfit, id]
    );

    if (!result.rows.length) return res.status(404).json({ message: "Data target tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ PUT target error:", err.message);
    res.status(500).json({ message: "Gagal memperbarui data target" });
  }
});

// ==========================================================
// 8️⃣ DELETE — Hapus target
// ==========================================================
router.delete("/targets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM targets WHERE id=$1 RETURNING *", [id]);

    if (!result.rows.length) return res.status(404).json({ message: "Data target tidak ditemukan" });
    res.json({ message: "Data target berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE target error:", err.message);
    res.status(500).json({ message: "Gagal menghapus data target" });
  }
});

export default router;