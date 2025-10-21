// ==========================================================
// 📄 Travel Dashboard Enterprise v5.3
// Document Controller (CRUD + Secure + PostgreSQL)
// ==========================================================
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 📋 Get All Documents
export const getAllDocuments = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM documents ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ getAllDocuments error:", err.message);
    res.status(500).json({ message: "Gagal memuat data dokumen" });
  }
};

// ➕ Create Document
export const createDocument = async (req, res) => {
  try {
    const {
      receiveDate,
      sendDate,
      guestName,
      passportVisa,
      processType,
      bookingCodeDMS,
      invoiceNumber,
      guestPhone,
      estimateFinish,
      staffName,
      tourCode,
    } = req.body;

    if (!guestName || !receiveDate)
      return res.status(400).json({ message: "Nama tamu dan tanggal terima wajib diisi" });

    const q = `
      INSERT INTO documents (
        receive_date, send_date, guest_name, passport_visa, process_type,
        booking_code_dms, invoice_number, guest_phone, estimate_finish,
        staff_name, tour_code
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `;

    const values = [
      receiveDate,
      sendDate,
      guestName,
      passportVisa,
      processType,
      bookingCodeDMS,
      invoiceNumber,
      guestPhone,
      estimateFinish,
      staffName,
      tourCode,
    ];

    await pool.query(q, values);
    res.status(201).json({ message: "✅ Data dokumen berhasil disimpan" });
  } catch (err) {
    console.error("❌ createDocument error:", err.message);
    res.status(500).json({ message: "Gagal menyimpan data dokumen" });
  }
};

// ✏️ Update Document
export const updateDocument = async (req, res) => {
  try {
    const id = req.params.id;
    const fields = [
      "receive_date",
      "send_date",
      "guest_name",
      "passport_visa",
      "process_type",
      "booking_code_dms",
      "invoice_number",
      "guest_phone",
      "estimate_finish",
      "staff_name",
      "tour_code",
    ];

    const updates = [];
    const values = [];
    let idx = 1;

    for (const key in req.body) {
      const dbField = fields.find((f) => f.replace(/_/, "") === key.toLowerCase());
      if (dbField) {
        updates.push(`${dbField} = $${idx++}`);
        values.push(req.body[key]);
      }
    }

    if (!updates.length) return res.status(400).json({ message: "Tidak ada data yang diperbarui" });

    values.push(id);
    await pool.query(`UPDATE documents SET ${updates.join(", ")} WHERE id = $${idx}`, values);
    res.json({ message: "✅ Data dokumen berhasil diperbarui" });
  } catch (err) {
    console.error("❌ updateDocument error:", err.message);
    res.status(500).json({ message: "Gagal memperbarui data dokumen" });
  }
};

// ❌ Delete Document
export const deleteDocument = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM documents WHERE id = $1", [id]);
    res.json({ message: "✅ Data dokumen berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteDocument error:", err.message);
    res.status(500).json({ message: "Gagal menghapus data dokumen" });
  }
};