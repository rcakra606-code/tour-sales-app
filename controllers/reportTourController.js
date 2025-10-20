/**
 * controllers/reportTourController.js
 * ============================================
 * Mengelola data tour (CRUD + reporting).
 */

import pool from "../config/database.js";
import logger from "../config/logger.js";

// ===== GET semua data tour =====
export async function getTours(req, res) {
  try {
    const { from, to } = req.query;
    let query = `SELECT * FROM tours`;
    const params = [];

    if (from && to) {
      query += ` WHERE departure_date BETWEEN $1 AND $2`;
      params.push(from, to);
    }

    query += ` ORDER BY registration_date DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    logger.error("❌ getTours:", err);
    res.status(500).json({ message: "Gagal memuat data tour" });
  }
}

// ===== GET satu tour =====
export async function getTourById(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM tours WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Tour tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    logger.error("❌ getTourById:", err);
    res.status(500).json({ message: "Gagal memuat data tour" });
  }
}

// ===== CREATE =====
export async function createTour(req, res) {
  try {
    const data = req.body;
    const {
      registrationDate,
      leadPassenger,
      allPassengers,
      tourCode,
      region,
      departureDate,
      bookingCode,
      tourPrice,
      discountRemarks,
      paymentProof,
      documentReceived,
      visaProcessStart,
      visaProcessEnd,
      documentRemarks,
      staff,
      salesAmount,
      profitAmount,
      departureStatus,
    } = data;

    const result = await pool.query(
      `
      INSERT INTO tours (
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
        created_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW()
      ) RETURNING *`,
      [
        registrationDate,
        leadPassenger,
        allPassengers,
        tourCode,
        region,
        departureDate,
        bookingCode,
        tourPrice,
        discountRemarks,
        paymentProof,
        documentReceived,
        visaProcessStart,
        visaProcessEnd,
        documentRemarks,
        staff,
        salesAmount,
        profitAmount,
        departureStatus,
      ]
    );

    logger.info(`✅ Tour ditambahkan: ${leadPassenger}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error("❌ createTour:", err);
    res.status(500).json({ message: "Gagal menambahkan tour" });
  }
}

// ===== UPDATE =====
export async function updateTour(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const {
      registrationDate,
      leadPassenger,
      allPassengers,
      tourCode,
      region,
      departureDate,
      bookingCode,
      tourPrice,
      discountRemarks,
      paymentProof,
      documentReceived,
      visaProcessStart,
      visaProcessEnd,
      documentRemarks,
      staff,
      salesAmount,
      profitAmount,
      departureStatus,
    } = data;

    const result = await pool.query(
      `
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
      WHERE id=$19 RETURNING *`,
      [
        registrationDate,
        leadPassenger,
        allPassengers,
        tourCode,
        region,
        departureDate,
        bookingCode,
        tourPrice,
        discountRemarks,
        paymentProof,
        documentReceived,
        visaProcessStart,
        visaProcessEnd,
        documentRemarks,
        staff,
        salesAmount,
        profitAmount,
        departureStatus,
        id,
      ]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Tour tidak ditemukan" });

    logger.info(`✏️ Tour diperbarui ID=${id}`);
    res.json(result.rows[0]);
  } catch (err) {
    logger.error("❌ updateTour:", err);
    res.status(500).json({ message: "Gagal memperbarui tour" });
  }
}

// ===== DELETE =====
export async function deleteTour(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM tours WHERE id=$1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Tour tidak ditemukan" });

    logger.info(`🗑️ Tour dihapus ID=${id}`);
    res.json({ message: "Tour dihapus" });
  } catch (err) {
    logger.error("❌ deleteTour:", err);
    res.status(500).json({ message: "Gagal menghapus tour" });
  }
}