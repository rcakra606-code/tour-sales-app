/**
 * ==========================================================
 * 📁 controllers/regionController.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Controller untuk modul Region Management:
 * - Ambil daftar region (distinct dari tabel tours)
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
 * 🌍 Ambil daftar semua region unik dari tabel tours
 */
export const getRegions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT region
      FROM tours
      WHERE region IS NOT NULL AND TRIM(region) <> ''
      ORDER BY region ASC
    `);

    res.json(result.rows.map(r => r.region));
  } catch (err) {
    console.error("❌ Gagal memuat data region:", err.message);
    res.status(500).json({ message: "Gagal memuat data region." });
  }
};