// ==========================================================
// 🧾 Log Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Menyimpan dan membaca audit log
// - Filter berdasarkan staff, aksi, atau tanggal
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 POST /api/logs — Tambah Log Baru
// ==========================================================
export async function addLog(req, res) {
  try {
    const { staff_name, action, description, module } = req.body;

    if (!staff_name || !action) {
      return res.status(400).json({ message: "Nama staff dan aksi wajib diisi." });
    }

    await pool.query(
      `
      INSERT INTO logs (staff_name, action, description, module)
      VALUES ($1, $2, $3, $4)
      `,
      [staff_name, action, description || "", module || ""]
    );

    res.json({ message: "Log berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Add log error:", err);
    res.status(500).json({ message: "Gagal menambahkan log aktivitas." });
  }
}

// ==========================================================
// 🔹 GET /api/logs — Ambil Semua Log
// ==========================================================
export async function getLogs(req, res) {
  try {
    const { staff, module, start, end } = req.query;
    let filters = [];
    let values = [];
    let i = 1;

    if (staff) {
      filters.push(`LOWER(staff_name) = LOWER($${i++})`);
      values.push(staff);
    }
    if (module) {
      filters.push(`LOWER(module) = LOWER($${i++})`);
      values.push(module);
    }
    if (start && end) {
      filters.push(`created_at BETWEEN $${i++} AND $${i++}`);
      values.push(start, end);
    }

    const whereClause = filters.length ? "WHERE " + filters.join(" AND ") : "";

    const query = `
      SELECT id, staff_name, action, description, module, created_at
      FROM logs
      ${whereClause}
      ORDER BY created_at DESC;
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Get logs error:", err);
    res.status(500).json({ message: "Gagal memuat log aktivitas." });
  }
}

// ==========================================================
// 🔹 DELETE /api/logs/:id — Hapus Log (Admin Only)
// ==========================================================
export async function deleteLog(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM logs WHERE id = $1", [id]);

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data log tidak ditemukan." });

    res.json({ message: "Log berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete log error:", err);
    res.status(500).json({ message: "Gagal menghapus log aktivitas." });
  }
}