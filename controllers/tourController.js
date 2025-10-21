// ==========================================================
// 🚐 Travel Dashboard Enterprise v5.3
// Tour Controller (CRUD + Role Secure + PostgreSQL)
// ==========================================================
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 📋 Get All Tours
export const getAllTours = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tours ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ getAllTours error:", err.message);
    res.status(500).json({ message: "Gagal memuat data tour" });
  }
};

// ➕ Create Tour
export const createTour = async (req, res) => {
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

    const q = `
      INSERT INTO tours (
        registration_date, lead_passenger, all_passengers, tour_code, region,
        departure_date, booking_code, tour_price, discount_remarks,
        payment_proof, document_received, visa_process_start, visa_process_end,
        document_remarks, staff, sales_amount, profit_amount, departure_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
    `;
    const values = [
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
    ];
    await pool.query(q, values);
    res.status(201).json({ message: "✅ Data tour berhasil disimpan" });
  } catch (err) {
    console.error("❌ createTour error:", err.message);
    res.status(500).json({ message: "Gagal menyimpan data tour" });
  }
};

// ✏️ Update Tour
export const updateTour = async (req, res) => {
  try {
    const id = req.params.id;
    const fields = [
      "registration_date",
      "lead_passenger",
      "all_passengers",
      "tour_code",
      "region",
      "departure_date",
      "booking_code",
      "tour_price",
      "discount_remarks",
      "payment_proof",
      "document_received",
      "visa_process_start",
      "visa_process_end",
      "document_remarks",
      "staff",
      "sales_amount",
      "profit_amount",
      "departure_status",
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
    await pool.query(`UPDATE tours SET ${updates.join(", ")} WHERE id = $${idx}`, values);
    res.json({ message: "✅ Data tour berhasil diperbarui" });
  } catch (err) {
    console.error("❌ updateTour error:", err.message);
    res.status(500).json({ message: "Gagal memperbarui data tour" });
  }
};

// ❌ Delete Tour
export const deleteTour = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM tours WHERE id = $1", [id]);
    res.json({ message: "✅ Data tour berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteTour error:", err.message);
    res.status(500).json({ message: "Gagal menghapus data tour" });
  }
};