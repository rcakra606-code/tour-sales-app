// ==========================================================
// 💰 Report Sales Controller — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import { pool } from "../server.js";

// ===== GET ALL SALES =====
export async function getAllSales(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM sales ORDER BY transaction_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Get sales error:", err);
    res.status(500).json({ message: "Gagal memuat data sales." });
  }
}

// ===== ADD SALES =====
export async function addSales(req, res) {
  try {
    const {
      transaction_date,
      invoice_number,
      customer_name,
      sales_category,
      sales_amount,
      profit_amount,
      staff_name
    } = req.body;

    if (!transaction_date || !invoice_number)
      return res.status(400).json({ message: "Tanggal dan nomor invoice wajib diisi." });

    await pool.query(
      `INSERT INTO sales (
        transaction_date, invoice_number, customer_name, sales_category,
        sales_amount, profit_amount, staff_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        transaction_date,
        invoice_number,
        customer_name,
        sales_category,
        sales_amount,
        profit_amount,
        staff_name
      ]
    );

    res.json({ message: "Data sales berhasil disimpan." });
  } catch (err) {
    console.error("❌ Add sales error:", err);
    res.status(500).json({ message: "Gagal menyimpan data sales." });
  }
}

// ===== DELETE SALES =====
export async function deleteSales(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM sales WHERE id = $1", [id]);
    res.json({ message: "Data sales berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete sales error:", err);
    res.status(500).json({ message: "Gagal menghapus data sales." });
  }
}