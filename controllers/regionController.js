// ==========================================================
// 🌍 Region Controller — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import { pool } from "../server.js";

// ===== GET ALL REGIONS =====
export async function getRegions(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, region_name, description, created_at FROM regions ORDER BY region_name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET regions error:", err);
    res.status(500).json({ message: "Gagal memuat data region." });
  }
}

// ===== CREATE REGION =====
export async function createRegion(req, res) {
  try {
    const { region_name, description } = req.body;
    if (!region_name)
      return res.status(400).json({ message: "Nama region wajib diisi." });

    await pool.query(
      "INSERT INTO regions (region_name, description) VALUES ($1, $2)",
      [region_name, description || ""]
    );

    res.json({ message: "Region berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Create region error:", err);
    res.status(500).json({ message: "Gagal menambahkan region." });
  }
}

// ===== DELETE REGION =====
export async function deleteRegion(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM regions WHERE id = $1", [id]);
    res.json({ message: "Region berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete region error:", err);
    res.status(500).json({ message: "Gagal menghapus region." });
  }
}