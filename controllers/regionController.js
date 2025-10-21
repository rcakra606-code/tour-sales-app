// ==========================================================
// 🌍 Travel Dashboard Enterprise v5.3
// Region Controller (CRUD + Secure + PostgreSQL)
// ==========================================================
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 📋 Get All Regions
export const getAllRegions = async (req, res) => {
  try {
    const search = req.query.search || "";
    const query = search
      ? "SELECT * FROM regions WHERE name ILIKE $1 OR code ILIKE $1 ORDER BY name ASC"
      : "SELECT * FROM regions ORDER BY name ASC";
    const values = search ? [`%${search}%`] : [];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ getAllRegions error:", err.message);
    res.status(500).json({ message: "Gagal memuat data region" });
  }
};

// ➕ Create Region
export const createRegion = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name)
      return res.status(400).json({ message: "Nama region wajib diisi" });

    await pool.query(
      "INSERT INTO regions (name, code) VALUES ($1, $2)",
      [name.trim(), code || null]
    );

    res.status(201).json({ message: "✅ Region baru berhasil ditambahkan" });
  } catch (err) {
    console.error("❌ createRegion error:", err.message);
    res.status(500).json({ message: "Gagal menambahkan region" });
  }
};

// ❌ Delete Region
export const deleteRegion = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM regions WHERE id = $1", [id]);
    res.json({ message: "✅ Region berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteRegion error:", err.message);
    res.status(500).json({ message: "Gagal menghapus region" });
  }
};