// ==========================================================
// ✈️ Tour Controller — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import { pool } from "../server.js";

// ===== GET ALL TOURS =====
export async function getTours(req, res) {
  try {
    const role = req.user.role;
    const staffName = req.user.staff_name;
    const whereClause = role === "staff" ? "WHERE staff_name = $1" : "";
    const params = role === "staff" ? [staffName] : [];

    const result = await pool.query(
      `
      SELECT 
        id, registration_date, lead_passenger, all_passengers,
        tour_code, region, departure_date, booking_code,
        tour_price, discount_remarks, payment_proof,
        document_received, visa_process_start, visa_process_end,
        document_remarks, staff_name, sales_amount, profit_amount,
        departure_status, created_at
      FROM tours
      ${whereClause}
      ORDER BY registration_date DESC
      `,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET tours error:", err);
    res.status(500).json({ message: "Gagal memuat data tour." });
  }
}

// ===== CREATE TOUR =====
export async function createTour(req, res) {
  try {
    const data = req.body;

    await pool.query(
      `
      INSERT INTO tours (
        registration_date, lead_passenger, all_passengers,
        tour_code, region, departure_date, booking_code,
        tour_price, discount_remarks, payment_proof,
        document_received, visa_process_start, visa_process_end,
        document_remarks, staff_name, sales_amount, profit_amount,
        departure_status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      `,
      [
        data.registration_date || data.registrationDate || null,
        data.lead_passenger || data.leadPassenger || "",
        data.all_passengers || data.allPassengers || "",
        data.tour_code || data.tourCode || "",
        data.region || "",
        data.departure_date || data.departureDate || null,
        data.booking_code || data.bookingCode || "",
        parseFloat(data.tour_price || data.tourPrice || 0),
        data.discount_remarks || data.discountRemarks || "",
        data.payment_proof || data.paymentProof || "",
        data.document_received || data.documentReceived || null,
        data.visa_process_start || data.visaProcessStart || null,
        data.visa_process_end || data.visaProcessEnd || null,
        data.document_remarks || data.documentRemarks || "",
        data.staff_name || data.staff || req.user.staff_name,
        parseFloat(data.sales_amount || data.salesAmount || 0),
        parseFloat(data.profit_amount || data.profitAmount || 0),
        data.departure_status || data.departureStatus || "PENDING"
      ]
    );

    res.json({ message: "Data tour berhasil disimpan." });
  } catch (err) {
    console.error("❌ Create tour error:", err);
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