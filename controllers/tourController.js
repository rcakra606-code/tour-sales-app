/**
 * ==========================================================
 * 📁 controllers/tourController.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Controller untuk modul Tour:
 * - Ambil semua data tour
 * - Tambah data tour baru
 * - Update data tour
 * - Hapus data tour
 * ==========================================================
 */

import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * 📋 Ambil semua data tour
 */
export const getTours = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, registration_date, lead_passenger, all_passengers, tour_code, region,
        departure_date, booking_code, tour_price, discount_remarks,
        payment_proof, document_received, visa_process_start, visa_process_end,
        document_remarks, staff, sales_amount, profit_amount, departure_status, created_at
      FROM tours
      ORDER BY departure_date DESC, registration_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Gagal memuat data tour:", err.message);
    res.status(500).json({ message: "Gagal memuat data tour." });
  }
};

/**
 * 💾 Tambah data tour baru
 */
export const createTour = async (req, res) => {
  try {
    const {
      registration_date,
      lead_passenger,
      all_passengers,
      tour_code,
      region,
      departure_date,
      booking_code,
      tour_price,
      discount_remarks,
      payment_proof,
      document_received,
      visa_process_start,
      visa_process_end,
      document_remarks,
      staff,
      sales_amount,
      profit_amount,
      departure_status
    } = req.body;

    await pool.query(
      `INSERT INTO tours (
        registration_date, lead_passenger, all_passengers, tour_code, region,
        departure_date, booking_code, tour_price, discount_remarks, payment_proof,
        document_received, visa_process_start, visa_process_end, document_remarks,
        staff, sales_amount, profit_amount, departure_status, created_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,NOW()
      )`,
      [
        registration_date,
        lead_passenger,
        all_passengers,
        tour_code,
        region,
        departure_date,
        booking_code,
        tour_price || 0,
        discount_remarks || "",
        payment_proof || "",
        document_received || null,
        visa_process_start || null,
        visa_process_end || null,
        document_remarks || "",
        staff || "",
        sales_amount || 0,
        profit_amount || 0,
        departure_status || "PENDING",
      ]
    );

    res.status(201).json({ message: "Data tour berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Gagal menambah data tour:", err.message);
    res.status(500).json({ message: "Gagal menambah data tour." });
  }
};

/**
 * ✏️ Update data tour berdasarkan ID
 */
export const updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      registration_date,
      lead_passenger,
      all_passengers,
      tour_code,
      region,
      departure_date,
      booking_code,
      tour_price,
      discount_remarks,
      payment_proof,
      document_received,
      visa_process_start,
      visa_process_end,
      document_remarks,
      staff,
      sales_amount,
      profit_amount,
      departure_status
    } = req.body;

    await pool.query(
      `UPDATE tours SET
        registration_date=$1, lead_passenger=$2, all_passengers=$3,
        tour_code=$4, region=$5, departure_date=$6, booking_code=$7,
        tour_price=$8, discount_remarks=$9, payment_proof=$10,
        document_received=$11, visa_process_start=$12, visa_process_end=$13,
        document_remarks=$14, staff=$15, sales_amount=$16, profit_amount=$17,
        departure_status=$18
       WHERE id=$19`,
      [
        registration_date,
        lead_passenger,
        all_passengers,
        tour_code,
        region,
        departure_date,
        booking_code,
        tour_price,
        discount_remarks,
        payment_proof,
        document_received,
        visa_process_start,
        visa_process_end,
        document_remarks,
        staff,
        sales_amount,
        profit_amount,
        departure_status,
        id,
      ]
    );

    res.json({ message: "Data tour berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Gagal memperbarui data tour:", err.message);
    res.status(500).json({ message: "Gagal memperbarui data tour." });
  }
};

/**
 * ❌ Hapus data tour
 */
export const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM tours WHERE id = $1", [id]);

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data tour tidak ditemukan." });

    res.json({ message: "Data tour berhasil dihapus." });
  } catch (err) {
    console.error("❌ Gagal menghapus data tour:", err.message);
    res.status(500).json({ message: "Gagal menghapus data tour." });
  }
};