// ==========================================================
// 📄 Travel Dashboard Enterprise v5.1
// Document Routes (CRUD + Search + Filter)
// ==========================================================

import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 1️⃣ GET — Ambil semua data dokumen (dengan filter & search)
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const { search = "", month = "" } = req.query;
    const params = [];
    let query = `
      SELECT * FROM documents
      WHERE 1=1
    `;

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (
        guest_name ILIKE $${params.length} OR
        invoice_number ILIKE $${params.length} OR
        booking_code_dms ILIKE $${params.length} OR
        staff_name ILIKE $${params.length}
      )`;
    }

    if (month) {
      params.push(`${month}-01`);
      query += ` AND DATE_TRUNC('month', receive_date) = DATE_TRUNC('month', $${params.length}::date)`;
    }

    query += " ORDER BY receive_date DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET documents error:", err.message);
    res.status(500).json({ message: "Gagal memuat data dokumen" });
  }
});

// ==========================================================
// 2️⃣ POST — Tambah data dokumen baru
// ==========================================================
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const query = `
      INSERT INTO documents (
        receive_date, send_date, guest_name, passport_visa, process_type,
        booking_code_dms, invoice_number, guest_phone, estimate_finish,
        staff_name, tour_code
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *;
    `;
    const values = [
      data.receiveDate || null,
      data.sendDate || null,
      data.guestName || "",
      data.passportVisa || "",
      data.processType || "Biasa",
      data.bookingCodeDMS || "",
      data.invoiceNumber || "",
      data.guestPhone || "",
      data.estimateFinish || null,
      data.staffName || "",
      data.tourCode || "",
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ POST document error:", err.message);
    res.status(500).json({ message: "Gagal menambahkan data dokumen" });
  }
});

// ==========================================================
// 3️⃣ PUT — Update data dokumen berdasarkan ID
// ==========================================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const query = `
      UPDATE documents SET
        receive_date=$1,
        send_date=$2,
        guest_name=$3,
        passport_visa=$4,
        process_type=$5,
        booking_code_dms=$6,
        invoice_number=$7,
        guest_phone=$8,
        estimate_finish=$9,
        staff_name=$10,
        tour_code=$11
      WHERE id=$12
      RETURNING *;
    `;
    const values = [
      data.receiveDate || null,
      data.sendDate || null,
      data.guestName || "",
      data.passportVisa || "",
      data.processType || "Biasa",
      data.bookingCodeDMS || "",
      data.invoiceNumber || "",
      data.guestPhone || "",
      data.estimateFinish || null,
      data.staffName || "",
      data.tourCode || "",
      id,
    ];

    const result = await pool.query(query, values);
    if (!result.rows.length)
      return res.status(404).json({ message: "Data dokumen tidak ditemukan" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ PUT document error:", err.message);
    res.status(500).json({ message: "Gagal memperbarui data dokumen" });
  }
});

// ==========================================================
// 4️⃣ DELETE — Hapus data dokumen
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM documents WHERE id=$1 RETURNING *", [id]);

    if (!result.rows.length)
      return res.status(404).json({ message: "Data dokumen tidak ditemukan" });

    res.json({ message: "Data dokumen berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE document error:", err.message);
    res.status(500).json({ message: "Gagal menghapus data dokumen" });
  }
});

export default router;