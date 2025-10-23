// ==========================================================
// 📑 Document Controller — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import { pool } from "../server.js";

// ===== GET ALL DOCUMENTS =====
export async function getDocuments(req, res) {
  try {
    const role = req.user.role;
    const staffName = req.user.staff_name;
    const whereClause = role === "staff" ? "WHERE staff_name = $1" : "";
    const params = role === "staff" ? [staffName] : [];

    const result = await pool.query(
      `
      SELECT 
        id, receive_date, send_date, guest_name, passport_visa, 
        process_type, booking_code_dms, invoice_number, phone_number, 
        estimated_finish, staff_name, tour_code, document_remarks, created_at
      FROM documents
      ${whereClause}
      ORDER BY receive_date DESC
      `,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET documents error:", err);
    res.status(500).json({ message: "Gagal memuat data dokumen." });
  }
}

// ===== CREATE DOCUMENT =====
export async function createDocument(req, res) {
  try {
    const data = req.body;
    const staffName = req.user.role === "staff" ? req.user.staff_name : data.staff_name;

    await pool.query(
      `
      INSERT INTO documents (
        receive_date, send_date, guest_name, passport_visa,
        process_type, booking_code_dms, invoice_number, phone_number,
        estimated_finish, staff_name, tour_code, document_remarks
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      `,
      [
        data.receive_date || null,
        data.send_date || null,
        data.guest_name || "",
        data.passport_visa || "",
        data.process_type || "",
        data.booking_code_dms || "",
        data.invoice_number || "",
        data.phone_number || "",
        data.estimated_finish || null,
        staffName || "",
        data.tour_code || "",
        data.document_remarks || ""
      ]
    );

    res.json({ message: "Dokumen berhasil disimpan." });
  } catch (err) {
    console.error("❌ Create document error:", err);
    res.status(500).json({ message: "Gagal menyimpan dokumen." });
  }
}

// ===== DELETE DOCUMENT =====
export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM documents WHERE id = $1", [id]);
    res.json({ message: "Dokumen berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete document error:", err);
    res.status(500).json({ message: "Gagal menghapus dokumen." });
  }
}