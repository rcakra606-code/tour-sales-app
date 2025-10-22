// ==========================================================
// 🌍 Region Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Ambil semua region
// - Tambah region baru
// - Update nama region
// - Hapus region
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/regions — Ambil Semua Region
// ==========================================================
export async function getRegions(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, name, created_at FROM regions ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET regions error:", err);
    res.status(500).json({ message: "Gagal memuat daftar region." });
  }
}

// ==========================================================
// 🔹 POST /api/regions — Tambah Region Baru
// ==========================================================
export async function createRegion(req, res) {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Nama region wajib diisi." });
    }

    const existing = await pool.query("SELECT id FROM regions WHERE LOWER(name) = LOWER($1)", [name]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Region sudah ada." });
    }

    await pool.query("INSERT INTO regions (name) VALUES ($1)", [name]);
    res.json({ message: "Region berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Create region error:", err);
    res.status(500).json({ message: "Gagal menambahkan region." });
  }
}

// ==========================================================
// 🔹 PUT /api/regions/:id — Update Region
// ==========================================================
export async function updateRegion(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Nama region wajib diisi." });
    }

    const result = await pool.query(
      "UPDATE regions SET name = $1 WHERE id = $2 RETURNING id",
      [name, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Region tidak ditemukan." });
    }

    res.json({ message: "Region berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Update region error:", err);
    res.status(500).json({ message: "Gagal memperbarui region." });
  }
}

// ==========================================================
// 🔹 DELETE /api/regions/:id — Hapus Region
// ==========================================================
export async function deleteRegion(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM regions WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Region tidak ditemukan." });
    }

    res.json({ message: "Region berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete region error:", err);
    res.status(500).json({ message: "Gagal menghapus region." });
  }
}