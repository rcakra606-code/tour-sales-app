import db from "../config/database.js";

export async function getTours(req, res){
  try{
    const q = await db.query(`
      SELECT t.*, r.name as region_name
      FROM tours t
      LEFT JOIN regions r ON r.id = t.region_id
      ORDER BY t.created_at DESC
    `);
    res.json(q.rows);
  }catch(err){
    console.error("GET tours error:", err);
    res.status(500).json({ message: "Gagal mengambil tours" });
  }
}

export async function createTour(req, res){
  try{
    const data = req.body;
    const q = await db.query(`
      INSERT INTO tours (registration_date, lead_passenger, all_passengers, tour_code, region_id, departure_date,
        booking_code, tour_price, discount_remarks, payment_proof, document_received, visa_process_start,
        visa_process_end, document_remarks, staff_name, sales_amount, profit_amount, departure_status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
      [
        data.registrationDate || null,
        data.leadPassenger || null,
        data.allPassengers || 1,
        data.tourCode || null,
        data.regionId || null,
        data.departureDate || null,
        data.bookingCode || null,
        data.tourPrice || 0,
        data.discountRemarks || null,
        data.paymentProof || null,
        data.documentReceived || false,
        data.visaProcessStart || null,
        data.visaProcessEnd || null,
        data.documentRemarks || null,
        data.staff || null,
        data.salesAmount || 0,
        data.profitAmount || 0,
        data.departureStatus || "PENDING"
      ]);
    res.json(q.rows[0]);
  }catch(err){
    console.error("CREATE tour error:", err);
    res.status(500).json({ message:"Gagal membuat tour" });
  }
}
