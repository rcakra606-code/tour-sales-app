// controllers/tourController.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * GET /api/tours
 * Ambil data semua tour (admin/semiadmin) atau tour milik staff
 */
export async function getTours(req, res) {
  try {
    const role = req.user.role;
    const staff = req.user.staff_name || req.user.username;

    let query = `
      SELECT 
        id, registration_date, lead_passenger, all_passengers, tour_code,
        region, departure_date, booking_code, tour_price, discount_remarks,
        payment_proof, document_received, visa_process_start, visa_process_end,
        document_remarks, staff, sales_amount, profit_amount, departure_status
      FROM tours
    `;

    let params = [];
    if (role === "staff") {
      query += " WHERE LOWER(staff) = LOWER($1)";
      params = [staff];
    }
    query += " ORDER BY registration_date DESC";

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ GET /api/tours error:", err);
    res.status(500).json({ message: "Gagal memuat data tour" });
  }
}

/**
 * POST /api/tours
 * Simpan data tour baru
 */
export async function createTour(req, res) {
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
      staff,
      salesAmount,
      profitAmount,
      departureStatus,
    } = req.body;

    if (!leadPassenger || !region || !departureDate) {
      return res.status(400).json({ message: "Lead passenger, region, dan tanggal wajib diisi" });
    }

    const q = `
      INSERT INTO tours (
        registration_date, lead_passenger, all_passengers, tour_code, region,
        departure_date, booking_code, tour_price, discount_remarks, payment_proof,
        document_received, visa_process_start, visa_process_end, document_remarks,
        staff, sales_amount, profit_amount, departure_status
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18
      )
      RETURNING id, lead_passenger, tour_code, region, staff, departure_status;
    `;

    const values = [
      registrationDate || new Date(),
      leadPassenger,
      allPassengers,
      tourCode,
      region,
      departureDate,
      bookingCode,
      tourPrice || 0,
      discountRemarks,
      paymentProof,
      documentReceived,
      visaProcessStart,
      visaProcessEnd,
      documentRemarks,
      staff,
      salesAmount || 0,
      profitAmount || 0,
      departureStatus || "PENDING",
    ];

    const { rows } = await pool.query(q, values);
    res.status(201).json({
      message: "Data tour berhasil disimpan",
      data: rows[0],
    });
  } catch (err) {
    console.error("❌ POST /api/tours error:", err);
    res.status(500).json({ message: "Gagal menyimpan data tour" });
  }
}

/**
 * DELETE /api/tours/:id
 * Hapus data tour (admin/semiadmin)
 */
export async function deleteTour(req, res) {
  try {
    const role = req.user.role;
    if (!["admin", "semiadmin"].includes(role)) {
      return res.status(403).json({ message: "Hanya Admin atau SemiAdmin yang dapat menghapus data" });
    }

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID tidak valid" });

    await pool.query(`DELETE FROM tours WHERE id = $1;`, [id]);
    res.json({ message: "Data tour berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE /api/tours error:", err);
    res.status(500).json({ message: "Gagal menghapus data tour" });
  }
}