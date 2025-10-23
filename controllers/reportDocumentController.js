// ==========================================================
// 📑 Report Document Controller — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import { pool } from "../server.js";

// ===== GET ALL DOCUMENTS =====
export async function getAllDocuments(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM documents ORDER BY receive_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Get documents error:", err);
    res.status(500).json({ message: "Gagal memuat data dokumen." });
  }
}

// ===== ADD DOCUMENT =====
export async function addDocument(req, res) {
  try {
    const {
      receive_date,
      send_date,
      guest_name,
      passport_visa,
      process_type,
      booking_code_dms,
      invoice_number,
      phone_number,
      estimated_finish,
      staff_name,
      tour_code,
      document_remarks
    } = req.body;

    if (!guest_name)
      return res.status(400).json({ message: "Nama tamu wajib diisi." });

    await pool.query(
      `INSERT INTO documents (
        receive_date, send_date, guest_name, passport_visa, process_type,
        booking_code_dms, invoice_number, phone_number, estimated_finish,
        staff_name, tour_code, document_remarks
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        receive_date,
        send_date,
        guest_name,
        passport_visa,
        process_type,
        booking_code_dms,
        invoice_number,
        phone_number,
        estimated_finish,
        staff_name,
        tour_code,
        document_remarks
      ]
    );

    res.json({ message: "Data dokumen berhasil disimpan." });
  } catch (err) {
    console.error("❌ Add document error:", err);
    res.status(500).json({ message: "Gagal menyimpan data dokumen." });
  }
}

// ===== DELETE DOCUMENT =====
export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM documents WHERE id = $1", [id]);
    res.json({ message: "Data dokumen berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete document error:", err);
    res.status(500).json({ message: "Gagal menghapus data dokumen." });
  }
}