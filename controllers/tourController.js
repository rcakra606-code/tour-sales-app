// ==========================================================
// ✈️ Tour Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Ambil semua data tour (filter per region, staff, bulan, status)
// - Tambah, update, hapus data tour
// - Terhubung dengan tabel region & reporting
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/tours — Ambil Semua Tour
// ==========================================================
export async function getTours(req, res) {
  try {
    const { region, staff, month, status } = req.query;
    let filters = [];
    let values = [];
    let i = 1;

    if (region) {
      filters.push(`LOWER(region) = LOWER($${i++})`);
      values.push(region);
    }
    if (staff) {
      filters.push(`LOWER(staff) = LOWER($${i++})`);
      values.push(staff);
    }
    if (month) {
      filters.push(`TO_CHAR(departure_date, 'YYYY-MM') = $${i++}`);
      values.push(month);
    }
    if (status) {
      filters.push(`LOWER(departure_status) = LOWER($${i++})`);
      values.push(status);
    }

    const whereClause = filters.length ? "WHERE " + filters.join(" AND ") : "";

    const query = `
      SELECT id, registration_date, lead_passenger, all_passengers, tour_code,
             region, departure_date, booking_code, tour_price, discount_remarks,
             payment_proof, document_received, visa_process_start, visa_process_end,
             document_remarks, staff, sales_amount, profit_amount, departure_status, created_at
      FROM tours
      ${whereClause}
      ORDER BY departure_date DESC;
    `;

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error("❌ GET tours error:", err);
    res.status(500).json({ message: "Gagal memuat data tour." });
  }
}

// ==========================================================
// 🔹 POST /api/tours — Tambah Tour Baru
// ==========================================================
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

    await pool.query(
      `
      INSERT INTO tours (
        registration_date, lead_passenger, all_passengers, tour_code, region,
        departure_date, booking_code, tour_price, discount_remarks, payment_proof,
        document_received, visa_process_start, visa_process_end, document_remarks,
        staff, sales_amount, profit_amount, departure_status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18
      )
      `,
      [
        registrationDate || null,
        leadPassenger || "",
        allPassengers || "",
        tourCode || "",
        region || "",
        departureDate || null,
        bookingCode || "",
        parseFloat(tourPrice) || 0,
        discountRemarks || "",
        paymentProof || "",
        documentReceived || null,
        visaProcessStart || null,
        visaProcessEnd || null,
        documentRemarks || "",
        staff || "",
        parseFloat(salesAmount) || 0,
        parseFloat(profitAmount) || 0,
        departureStatus || "PENDING",
      ]
    );

    res.json({ message: "Data tour berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Create tour error:", err);
    res.status(500).json({ message: "Gagal menambahkan data tour." });
  }
}

// ==========================================================
// 🔹 PUT /api/tours/:id — Update Data Tour
// ==========================================================
export async function updateTour(req, res) {
  try {
    const { id } = req.params;
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

    const result = await pool.query(
      `
      UPDATE tours SET
        registration_date=$1, lead_passenger=$2, all_passengers=$3, tour_code=$4, region=$5,
        departure_date=$6, booking_code=$7, tour_price=$8, discount_remarks=$9, payment_proof=$10,
        document_received=$11, visa_process_start=$12, visa_process_end=$13, document_remarks=$14,
        staff=$15, sales_amount=$16, profit_amount=$17, departure_status=$18
      WHERE id=$19
      RETURNING id;
      `,
      [
        registrationDate || null,
        leadPassenger || "",
        allPassengers || "",
        tourCode || "",
        region || "",
        departureDate || null,
        bookingCode || "",
        parseFloat(tourPrice) || 0,
        discountRemarks || "",
        paymentProof || "",
        documentReceived || null,
        visaProcessStart || null,
        visaProcessEnd || null,
        documentRemarks || "",
        staff || "",
        parseFloat(salesAmount) || 0,
        parseFloat(profitAmount) || 0,
        departureStatus || "PENDING",
        id,
      ]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data tour tidak ditemukan." });

    res.json({ message: "Data tour berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Update tour error:", err);
    res.status(500).json({ message: "Gagal memperbarui data tour." });
  }
}

// ==========================================================
// 🔹 DELETE /api/tours/:id — Hapus Data Tour
// ==========================================================
export async function deleteTour(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM tours WHERE id = $1", [id]);

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data tour tidak ditemukan." });

    res.json({ message: "Data tour berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete tour error:", err);
    res.status(500).json({ message: "Gagal menghapus data tour." });
  }
}