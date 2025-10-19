/**
 * ==========================================================
 * 📁 controllers/documentController.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Controller untuk modul Document Management:
 * - Ambil semua data dokumen
 * - Tambah data dokumen baru
 * - Hapus dokumen berdasarkan ID
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
 * 📋 Ambil semua data dokumen
 */
export const getDocuments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, received_date, guest_name, booking_code, tour_code, remarks, created_at
      FROM documents
      ORDER BY received_date DESC, created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Gagal memuat data dokumen:", err.message);
    res.status(500).json({ message: "Gagal memuat data dokumen." });
  }
};

/**
 * 💾 Tambah data dokumen baru
 */
export const createDocument = async (req, res) => {
  try {
    const { received_date, guest_name, booking_code, tour_code, remarks } = req.body;

    if (!received_date || !guest_name) {
      return res.status(400).json({ message: "Tanggal terima dan nama tamu wajib diisi." });
    }

    await pool.query(
      `INSERT INTO documents (received_date, guest_name, booking_code, tour_code, remarks, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [received_date, guest_name, booking_code || "", tour_code || "", remarks || ""]
    );

    res.status(201).json({ message: "Data dokumen berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Gagal menambah data dokumen:", err.message);
    res.status(500).json({ message: "Gagal menambah data dokumen." });
  }
};

/**
 * ❌ Hapus data dokumen berdasarkan ID
 */
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID dokumen tidak ditemukan." });

    const result = await pool.query("DELETE FROM documents WHERE id = $1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data dokumen tidak ditemukan." });

    res.json({ message: "Data dokumen berhasil dihapus." });
  } catch (err) {
    console.error("❌ Gagal menghapus data dokumen:", err.message);
    res.status(500).json({ message: "Gagal menghapus data dokumen." });
  }
};