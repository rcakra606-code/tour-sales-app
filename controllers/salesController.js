/**
 * ==========================================================
 * 📁 controllers/salesController.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Controller untuk modul Sales:
 * - Ambil semua data sales
 * - Tambah data sales baru
 * - Hapus data sales berdasarkan ID
 * ==========================================================
 */

import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * 📋 Ambil seluruh data sales
 */
export const getSales = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, staff_name, transaction_date, sales_amount, profit_amount, created_at
      FROM sales
      ORDER BY transaction_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Gagal memuat data sales:", err.message);
    res.status(500).json({ message: "Gagal memuat data sales." });
  }
};

/**
 * 💾 Tambah data sales baru
 */
export const createSale = async (req, res) => {
  try {
    const { staff_name, transaction_date, sales_amount, profit_amount } = req.body;
    if (!staff_name || !transaction_date) {
      return res.status(400).json({ message: "Data tidak lengkap." });
    }

    await pool.query(
      `INSERT INTO sales (staff_name, transaction_date, sales_amount, profit_amount, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [staff_name, transaction_date, sales_amount || 0, profit_amount || 0]
    );

    res.status(201).json({ message: "Data sales berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Gagal menambah data sales:", err.message);
    res.status(500).json({ message: "Gagal menambah data sales." });
  }
};

/**
 * ❌ Hapus data sales berdasarkan ID
 */
export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID tidak ditemukan." });

    const result = await pool.query("DELETE FROM sales WHERE id = $1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data sales tidak ditemukan." });

    res.json({ message: "Data sales berhasil dihapus." });
  } catch (err) {
    console.error("❌ Gagal menghapus data sales:", err.message);
    res.status(500).json({ message: "Gagal menghapus data sales." });
  }
};