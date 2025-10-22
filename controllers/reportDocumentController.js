// ==========================================================
// 📑 Report Document Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - CRUD dokumen tamu
// - Filter per staff, tanggal, dan jenis proses
// - Rekap untuk dashboard dan laporan
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/report/documents — Ambil Semua Data Dokumen
// ==========================================================
export async function getDocuments(req, res) {
  try {
    const { staff, month, process_type } = req.query;
    let filters = [];
    let values = [];
    let i = 1;

    if (staff) {
      filters.push(`LOWER(staff_name) = LOWER($${i++})`);
      values.push(staff);
    }
    if (month) {
      filters.push(`TO_CHAR(receive_date, 'YYYY-MM') = $${i++}`);
      values.push(month);
    }
    if (process_type) {
      filters.push(`LOWER(process_type) = LOWER($${i++})`);
      values.push(process_type);
    }

    const whereClause = filters.length ? "WHERE " + filters.join(" AND ") : "";

    const query = `
      SELECT 
        id, receive_date, send_date, guest_name, passport_country, process_type,
        booking_code_dms, invoice_number, guest_phone, estimate_completion,
        staff_name, tour_code, created_at
      FROM documents
      ${whereClause}
      ORDER BY receive_date DESC;
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Get documents error:", err);
    res.status(500).json({ message: "Gagal memuat data dokumen." });
  }
}

// ==========================================================
// 🔹 POST /api/report/documents — Tambah Dokumen Baru
// ==========================================================
export async function createDocument(req, res) {
  try {
    const {
      receive_date,
      send_date,
      guest_name,
      passport_country,
      process_type,
      booking_code_dms,
      invoice_number,
      guest_phone,
      estimate_completion,
      staff_name,
      tour_code,
    } = req.body;

    await pool.query(
      `
      INSERT INTO documents (
        receive_date, send_date, guest_name, passport_country, process_type,
        booking_code_dms, invoice_number, guest_phone, estimate_completion,
        staff_name, tour_code
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `,
      [
        receive_date || null,
        send_date || null,
        guest_name || "",
        passport_country || "",
        process_type || "",
        booking_code_dms || "",
        invoice_number || "",
        guest_phone || "",
        estimate_completion || null,
        staff_name || "",
        tour_code || "",
      ]
    );

    res.json({ message: "Data dokumen berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Create document error:", err);
    res.status(500).json({ message: "Gagal menambahkan dokumen." });
  }
}

// ==========================================================
// 🔹 PUT /api/report/documents/:id — Update Dokumen
// ==========================================================
export async function updateDocument(req, res) {
  try {
    const { id } = req.params;
    const {
      receive_date,
      send_date,
      guest_name,
      passport_country,
      process_type,
      booking_code_dms,
      invoice_number,
      guest_phone,
      estimate_completion,
      staff_name,
      tour_code,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE documents SET
        receive_date=$1, send_date=$2, guest_name=$3, passport_country=$4,
        process_type=$5, booking_code_dms=$6, invoice_number=$7, guest_phone=$8,
        estimate_completion=$9, staff_name=$10, tour_code=$11
      WHERE id=$12 RETURNING id
      `,
      [
        receive_date || null,
        send_date || null,
        guest_name || "",
        passport_country || "",
        process_type || "",
        booking_code_dms || "",
        invoice_number || "",
        guest_phone || "",
        estimate_completion || null,
        staff_name || "",
        tour_code || "",
        id,
      ]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data dokumen tidak ditemukan." });

    res.json({ message: "Data dokumen berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Update document error:", err);
    res.status(500).json({ message: "Gagal memperbarui dokumen." });
  }
}

// ==========================================================
// 🔹 DELETE /api/report/documents/:id — Hapus Dokumen
// ==========================================================
export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM documents WHERE id = $1", [id]);

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data dokumen tidak ditemukan." });

    res.json({ message: "Dokumen berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete document error:", err);
    res.status(500).json({ message: "Gagal menghapus dokumen." });
  }
}