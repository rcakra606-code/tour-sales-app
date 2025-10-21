// controllers/documentController.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * GET /api/documents
 * Ambil semua data dokumen (admin/semiadmin) atau milik staff sendiri
 */
export async function getDocuments(req, res) {
  try {
    const role = req.user.role;
    const staff = req.user.staff_name || req.user.username;

    let query = `
      SELECT 
        id, received_date, sent_date, guest_name, document_type, process_type,
        booking_code, invoice_number, guest_phone, estimated_finish,
        staff_name, tour_code
      FROM documents
    `;

    let params = [];
    if (role === "staff") {
      query += " WHERE LOWER(staff_name) = LOWER($1)";
      params = [staff];
    }
    query += " ORDER BY received_date DESC";

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ GET /api/documents error:", err);
    res.status(500).json({ message: "Gagal memuat data dokumen" });
  }
}

/**
 * POST /api/documents
 * Simpan data dokumen baru
 */
export async function createDocument(req, res) {
  try {
    const {
      receivedDate,
      sentDate,
      guestName,
      documentType,
      processType,
      bookingCode,
      invoiceNumber,
      guestPhone,
      estimatedFinish,
      staffName,
      tourCode,
    } = req.body;

    if (!receivedDate || !guestName || !staffName) {
      return res.status(400).json({ message: "Tanggal terima, nama tamu, dan staff wajib diisi" });
    }

    const q = `
      INSERT INTO documents (
        received_date, sent_date, guest_name, document_type, process_type,
        booking_code, invoice_number, guest_phone, estimated_finish,
        staff_name, tour_code
      )
      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,
        $10,$11
      )
      RETURNING id, guest_name, booking_code, document_type, staff_name;
    `;

    const values = [
      receivedDate,
      sentDate,
      guestName,
      documentType,
      processType,
      bookingCode,
      invoiceNumber,
      guestPhone,
      estimatedFinish,
      staffName,
      tourCode,
    ];

    const { rows } = await pool.query(q, values);
    res.status(201).json({
      message: "Data dokumen berhasil disimpan",
      data: rows[0],
    });
  } catch (err) {
    console.error("❌ POST /api/documents error:", err);
    res.status(500).json({ message: "Gagal menyimpan data dokumen" });
  }
}

/**
 * DELETE /api/documents/:id
 * Hapus data dokumen (admin/semiadmin)
 */
export async function deleteDocument(req, res) {
  try {
    const role = req.user.role;
    if (!["admin", "semiadmin"].includes(role)) {
      return res.status(403).json({ message: "Hanya Admin atau SemiAdmin yang dapat menghapus data" });
    }

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID tidak valid" });

    await pool.query(`DELETE FROM documents WHERE id = $1;`, [id]);
    res.json({ message: "Data dokumen berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE /api/documents error:", err);
    res.status(500).json({ message: "Gagal menghapus data dokumen" });
  }
}