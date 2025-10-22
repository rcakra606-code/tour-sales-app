// ==========================================================
// 🎯 Target Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - CRUD target sales & profit bulanan
// - Validasi duplikat per staff per bulan
// - API untuk dashboard & executive comparison
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/targets — Ambil Semua Target (admin & semiadmin)
// ==========================================================
export async function getTargets(req, res) {
  try {
    const result = await pool.query(`
      SELECT id, staff_name, month, target_sales, target_profit, created_at
      FROM targets
      ORDER BY month DESC, staff_name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Get targets error:", err);
    res.status(500).json({ message: "Gagal memuat data target." });
  }
}

// ==========================================================
// 🔹 POST /api/targets — Tambah Target Baru
// ==========================================================
export async function createTarget(req, res) {
  try {
    const { staff_name, month, target_sales, target_profit } = req.body;

    if (!staff_name || !month) {
      return res.status(400).json({ message: "Nama staff dan bulan wajib diisi." });
    }

    // Pastikan tidak duplikat
    const exists = await pool.query(
      "SELECT id FROM targets WHERE LOWER(staff_name) = LOWER($1) AND month = $2",
      [staff_name, month]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "Target untuk staff ini di bulan tersebut sudah ada." });
    }

    await pool.query(
      `
      INSERT INTO targets (staff_name, month, target_sales, target_profit)
      VALUES ($1, $2, $3, $4)
      `,
      [staff_name, month, parseFloat(target_sales) || 0, parseFloat(target_profit) || 0]
    );

    res.json({ message: "Target berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Create target error:", err);
    res.status(500).json({ message: "Gagal menambahkan target." });
  }
}

// ==========================================================
// 🔹 PUT /api/targets/:id — Update Target
// ==========================================================
export async function updateTarget(req, res) {
  try {
    const { id } = req.params;
    const { staff_name, month, target_sales, target_profit } = req.body;

    const result = await pool.query(
      `
      UPDATE targets SET
        staff_name = $1,
        month = $2,
        target_sales = $3,
        target_profit = $4
      WHERE id = $5
      RETURNING id
      `,
      [staff_name, month, parseFloat(target_sales) || 0, parseFloat(target_profit) || 0, id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data target tidak ditemukan." });

    res.json({ message: "Target berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Update target error:", err);
    res.status(500).json({ message: "Gagal memperbarui target." });
  }
}

// ==========================================================
// 🔹 DELETE /api/targets/:id — Hapus Target
// ==========================================================
export async function deleteTarget(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM targets WHERE id = $1", [id]);

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data target tidak ditemukan." });

    res.json({ message: "Target berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete target error:", err);
    res.status(500).json({ message: "Gagal menghapus target." });
  }
}

// ==========================================================
// 🔹 GET /api/targets/:staff_name — Ambil Target Staff (Untuk Dashboard)
// ==========================================================
export async function getStaffTarget(req, res) {
  try {
    const { staff_name } = req.params;
    const { month } = req.query;

    const query = `
      SELECT staff_name, month, target_sales, target_profit
      FROM targets
      WHERE LOWER(staff_name) = LOWER($1)
      ${month ? "AND month = $2" : ""}
      ORDER BY month DESC
      LIMIT 1;
    `;

    const values = month ? [staff_name, month] : [staff_name];
    const result = await pool.query(query, values);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Target tidak ditemukan." });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Get staff target error:", err);
    res.status(500).json({ message: "Gagal memuat target staff." });
  }
}