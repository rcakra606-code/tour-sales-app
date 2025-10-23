// ==========================================================
// 💰 Sales Controller — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import { pool } from "../server.js";

// ===== GET ALL SALES =====
export async function getSales(req, res) {
  try {
    const role = req.user.role;
    const staffName = req.user.staff_name;
    const whereClause = role === "staff" ? "WHERE staff_name = $1" : "";
    const params = role === "staff" ? [staffName] : [];

    const result = await pool.query(
      `
      SELECT 
        id, transaction_date, invoice_number, customer_name, 
        sales_category, sales_amount, profit_amount, staff_name, created_at
      FROM sales
      ${whereClause}
      ORDER BY transaction_date DESC
      `,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET sales error:", err);
    res.status(500).json({ message: "Gagal memuat data sales." });
  }
}

// ===== CREATE SALES =====
export async function createSale(req, res) {
  try {
    const data = req.body;
    const staffName = req.user.role === "staff" ? req.user.staff_name : data.staff_name;

    await pool.query(
      `
      INSERT INTO sales (
        transaction_date, invoice_number, customer_name, 
        sales_category, sales_amount, profit_amount, staff_name
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        data.transaction_date || null,
        data.invoice_number || "",
        data.customer_name || "",
        data.sales_category || "",
        parseFloat(data.sales_amount || 0),
        parseFloat(data.profit_amount || 0),
        staffName || ""
      ]
    );

    res.json({ message: "Data sales berhasil disimpan." });
  } catch (err) {
    console.error("❌ Create sales error:", err);
    res.status(500).json({ message: "Gagal menyimpan data sales." });
  }
}

// ===== DELETE SALES =====
export async function deleteSale(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM sales WHERE id = $1", [id]);
    res.json({ message: "Data sales berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete sales error:", err);
    res.status(500).json({ message: "Gagal menghapus data sales." });
  }
}