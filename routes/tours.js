/**
 * ==========================================================
 * routes/tours.js — Travel Dashboard Enterprise v3.2
 * ==========================================================
 * CRUD Data Tour dengan integrasi:
 * ✅ Field booking, dokumen, keuangan (sales & profit)
 * ✅ Role-based access (super / semi / basic)
 * ✅ Logging otomatis
 * ✅ SQLite aman & modular
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const { getDB } = require("../db");
const auth = require("../middleware/auth");
const { logAction } = require("../middleware/log");

// Middleware auth di semua route
router.use(auth);

// Role checker sederhana
function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.user;
    if (!roles.includes(user.type)) {
      return res.status(403).json({ error: "Akses ditolak: role tidak diizinkan." });
    }
    next();
  };
}

/* =====================================================
   🟢 GET ALL TOURS
   ===================================================== */
router.get("/", (req, res) => {
  try {
    const db = getDB();
    const tours = db
      .prepare("SELECT * FROM tours ORDER BY id DESC")
      .all();
    res.json(tours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   🟢 CREATE TOUR (super & semi)
   ===================================================== */
router.post("/", requireRole("super", "semi"), (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const data = req.body;

    db.prepare(`
      INSERT INTO tours (
        registrationDate, leadPassenger, allPassengers, tourCode, region,
        departureDate, bookingCode, tourPrice, discountRemarks, paymentProof,
        documentReceived, visaProcessStart, visaProcessEnd, documentRemarks,
        staff, salesAmount, profitAmount, departureStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.registrationDate || "",
      data.leadPassenger || "",
      data.allPassengers || "",
      data.tourCode || "",
      data.region || "",
      data.departureDate || "",
      data.bookingCode || "",
      data.tourPrice || 0,
      data.discountRemarks || "",
      data.paymentProof || "",
      data.documentReceived || "",
      data.visaProcessStart || "",
      data.visaProcessEnd || "",
      data.documentRemarks || "",
      user.username || data.staff || "",
      data.salesAmount || 0,
      data.profitAmount || 0,
      data.departureStatus || "PENDING"
    );

    logAction(user, "Menambahkan Tour Baru", data.tourCode || "-");
    res.json({ message: "✅ Data tour berhasil ditambahkan" });
  } catch (err) {
    console.error("Create Tour Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   🟡 UPDATE TOUR (super & semi)
   ===================================================== */
router.put("/:id", requireRole("super", "semi"), (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const data = req.body;

    const exists = db.prepare("SELECT * FROM tours WHERE id=?").get(req.params.id);
    if (!exists) return res.status(404).json({ error: "Data tour tidak ditemukan." });

    db.prepare(`
      UPDATE tours SET
        registrationDate=?, leadPassenger=?, allPassengers=?, tourCode=?, region=?,
        departureDate=?, bookingCode=?, tourPrice=?, discountRemarks=?, paymentProof=?,
        documentReceived=?, visaProcessStart=?, visaProcessEnd=?, documentRemarks=?,
        staff=?, salesAmount=?, profitAmount=?, departureStatus=?
      WHERE id=?
    `).run(
      data.registrationDate || "",
      data.leadPassenger || "",
      data.allPassengers || "",
      data.tourCode || "",
      data.region || "",
      data.departureDate || "",
      data.bookingCode || "",
      data.tourPrice || 0,
      data.discountRemarks || "",
      data.paymentProof || "",
      data.documentReceived || "",
      data.visaProcessStart || "",
      data.visaProcessEnd || "",
      data.documentRemarks || "",
      user.username || data.staff || "",
      data.salesAmount || 0,
      data.profitAmount || 0,
      data.departureStatus || "PENDING",
      req.params.id
    );

    logAction(user, "Mengubah Data Tour", data.tourCode || exists.tourCode || "-");
    res.json({ message: "✅ Data tour berhasil diperbarui" });
  } catch (err) {
    console.error("Update Tour Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   🔴 DELETE TOUR (super only)
   ===================================================== */
router.delete("/:id", requireRole("super"), (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    const exists = db.prepare("SELECT * FROM tours WHERE id=?").get(req.params.id);
    if (!exists) return res.status(404).json({ error: "Data tour tidak ditemukan." });

    db.prepare("DELETE FROM tours WHERE id=?").run(req.params.id);
    logAction(user, "Menghapus Data Tour", exists.tourCode || `ID ${req.params.id}`);

    res.json({ message: "🗑️ Data tour berhasil dihapus" });
  } catch (err) {
    console.error("Delete Tour Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   🔍 GET SINGLE TOUR (DETAIL)
   ===================================================== */
router.get("/:id", (req, res) => {
  try {
    const db = getDB();
    const tour = db.prepare("SELECT * FROM tours WHERE id=?").get(req.params.id);
    if (!tour) return res.status(404).json({ error: "Data tour tidak ditemukan." });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
