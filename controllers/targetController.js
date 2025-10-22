// ==========================================================
// 🎯 Target Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Tambah / Update target per staff per bulan
// - Ambil target berdasarkan staff dan bulan
// - Ambil semua target (untuk executive dashboard)
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 POST /api/targets — Tambah atau Update Target
// ==========================================================
export async function upsertTarget(req, res) {
  try {
    const { staff_name, month, target_sales, target_profit } = req.body;

    if (!staff_name || !month) {
      return res.status(400).json({ message: "Staff dan bulan wajib diisi." });
    }

    const query = `
      INSERT INTO targets (staff_name, month, target_sales, target_profit)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (staff_name, month)
      DO UPDATE SET target_sales = EXCLUDED.target_sales, target_profit = EXCLUDED.target_profit;
    `;

    await pool.query(query, [
      staff_name,
      month,
      parseFloat(target_sales) || 0,
      parseFloat(target_profit) || 0,
    ]);

    res.json({ message: "Target berhasil disimpan atau diperbarui." });
  } catch (err) {
    console.error("❌ Upsert target error:", err);
    res.status(500).json({ message: "Gagal menyimpan target." });
  }
}

// ==========================================================
// 🔹 GET /api/targets — Ambil Semua Target
// ==========================================================
export async function getAllTargets(req, res) {
  try {
    const query = `
      SELECT id, staff_name, month, target_sales, target_profit
      FROM targets
      ORDER BY staff_name ASC, month DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("❌ Get all targets error:", err);
    res.status(500).json({ message: "Gagal memuat data target." });
  }
}

// ==========================================================
// 🔹 GET /api/targets/:staff/:month — Ambil Target Spesifik
// ==========================================================
export async function getTargetByStaffMonth(req, res) {
  try {
    const { staff, month } = req.params;

    const query = `
      SELECT staff_name, month, target_sales, target_profit
      FROM targets
      WHERE LOWER(staff_name) = LOWER($1) AND month = $2;
    `;
    const { rows } = await pool.query(query, [staff, month]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Target tidak ditemukan." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Get target by staff/month error:", err);
    res.status(500).json({ message: "Gagal mengambil data target." });
  }
}

// ==========================================================
// 🔹 DELETE /api/targets/:id — Hapus Target
// ==========================================================
export async function deleteTarget(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM targets WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data target tidak ditemukan." });
    }

    res.json({ message: "Target berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete target error:", err);
    res.status(500).json({ message: "Gagal menghapus target." });
  }
}