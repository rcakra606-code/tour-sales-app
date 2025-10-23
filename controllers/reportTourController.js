// ==========================================================
// ✈️ Report Tour Controller — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import { pool } from "../server.js";

// ===== GET ALL TOURS =====
export async function getAllTours(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM tours ORDER BY registration_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Get tours error:", err);
    res.status(500).json({ message: "Gagal memuat data tour." });
  }
}

// ===== ADD TOUR =====
export async function addTour(req, res) {
  try {
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
      staff_name,
      salesAmount,
      profitAmount,
      departureStatus
    } = req.body;

    if (!leadPassenger)
      return res.status(400).json({ message: "Nama lead passenger wajib diisi." });

    await pool.query(
      `INSERT INTO tours (
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
        staff_name,
        sales_amount,
        profit_amount,
        departure_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
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
        staff_name,
        salesAmount,
        profitAmount,
        departureStatus
      ]
    );

    res.json({ message: "Data tour berhasil disimpan." });
  } catch (err) {
    console.error("❌ Add tour error:", err);
    res.status(500).json({ message: "Gagal menyimpan data tour." });
  }
}

// ===== DELETE TOUR =====
export async function deleteTour(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tours WHERE id = $1", [id]);
    res.json({ message: "Data tour berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete tour error:", err);
    res.status(500).json({ message: "Gagal menghapus data tour." });
  }
}