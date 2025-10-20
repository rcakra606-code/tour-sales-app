// ==========================================================
// ✈️ Travel Dashboard Enterprise v5.1
// Tours Routes (CRUD + Filter + Search)
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
// 1️⃣ GET — Ambil semua data tour (dengan filter opsional)
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const { search = "", month = "" } = req.query;
    const params = [];
    let query = `
      SELECT * FROM tours
      WHERE 1=1
    `;

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (lead_passenger ILIKE $${params.length} OR region ILIKE $${params.length} OR tour_code ILIKE $${params.length} OR staff ILIKE $${params.length})`;
    }

    if (month) {
      params.push(`${month}-01`);
      query += ` AND DATE_TRUNC('month', departure_date) = DATE_TRUNC('month', $${params.length}::date)`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET tours error:", err.message);
    res.status(500).json({ message: "Gagal memuat data tour" });
  }
});

// ==========================================================
// 2️⃣ POST — Tambah data tour baru
// ==========================================================
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const query = `
      INSERT INTO tours (
        registration_date, lead_passenger, all_passengers, tour_code, region,
        departure_date, booking_code, tour_price, discount_remarks,
        payment_proof, document_received, visa_process_start, visa_process_end,
        document_remarks, staff, sales_amount, profit_amount, departure_status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
      )
      RETURNING *;
    `;
    const values = [
      data.registrationDate || null,
      data.leadPassenger || "",
      data.allPassengers || "",
      data.tourCode || "",
      data.region || "",
      data.departureDate || null,
      data.bookingCode || "",
      data.tourPrice || 0,
      data.discountRemarks || "",
      data.paymentProof || "",
      data.documentReceived || null,
      data.visaProcessStart || null,
      data.visaProcessEnd || null,
      data.documentRemarks || "",
      data.staff || "",
      data.salesAmount || 0,
      data.profitAmount || 0,
      data.departureStatus || "PENDING",
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ POST tour error:", err.message);
    res.status(500).json({ message: "Gagal menambahkan data tour" });
  }
});

// ==========================================================
// 3️⃣ PUT — Update data tour berdasarkan ID
// ==========================================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const query = `
      UPDATE tours SET
        registration_date=$1,
        lead_passenger=$2,
        all_passengers=$3,
        tour_code=$4,
        region=$5,
        departure_date=$6,
        booking_code=$7,
        tour_price=$8,
        discount_remarks=$9,
        payment_proof=$10,
        document_received=$11,
        visa_process_start=$12,
        visa_process_end=$13,
        document_remarks=$14,
        staff=$15,
        sales_amount=$16,
        profit_amount=$17,
        departure_status=$18
      WHERE id=$19
      RETURNING *;
    `;

    const values = [
      data.registrationDate || null,
      data.leadPassenger || "",
      data.allPassengers || "",
      data.tourCode || "",
      data.region || "",
      data.departureDate || null,
      data.bookingCode || "",
      data.tourPrice || 0,
      data.discountRemarks || "",
      data.paymentProof || "",
      data.documentReceived || null,
      data.visaProcessStart || null,
      data.visaProcessEnd || null,
      data.documentRemarks || "",
      data.staff || "",
      data.salesAmount || 0,
      data.profitAmount || 0,
      data.departureStatus || "PENDING",
      id,
    ];

    const result = await pool.query(query, values);
    if (!result.rows.length)
      return res.status(404).json({ message: "Data tour tidak ditemukan" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ PUT tour error:", err.message);
    res.status(500).json({ message: "Gagal memperbarui data tour" });
  }
});

// ==========================================================
// 4️⃣ DELETE — Hapus data tour
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM tours WHERE id=$1 RETURNING *", [id]);

    if (!result.rows.length)
      return res.status(404).json({ message: "Data tour tidak ditemukan" });

    res.json({ message: "Data tour berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE tour error:", err.message);
    res.status(500).json({ message: "Gagal menghapus data tour" });
  }
});

export default router;