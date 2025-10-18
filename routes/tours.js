const express = require("express");
const router = express.Router();
const { getDB } = require("../db");
const auth = require("../middleware/auth");
const { logAction } = require("../middleware/log");

router.use(auth);

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.type))
      return res.status(403).json({ error: "Akses ditolak" });
    next();
  };
}

router.get("/", (req, res) => {
  try {
    const db = getDB();
    const tours = db.prepare("SELECT * FROM tours ORDER BY id DESC").all();
    res.json(tours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", (req, res) => {
  try {
    const db = getDB();
    const tour = db.prepare("SELECT * FROM tours WHERE id=?").get(req.params.id);
    if (!tour) return res.status(404).json({ error: "Tour tidak ditemukan" });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", requireRole("super", "semi"), (req, res) => {
  try {
    const db = getDB();
    const u = req.user;
    const d = req.body;
    db.prepare(`
      INSERT INTO tours (
        registrationDate, leadPassenger, allPassengers, tourCode, region,
        departureDate, bookingCode, tourPrice, discountRemarks, paymentProof,
        documentReceived, visaProcessStart, visaProcessEnd, documentRemarks,
        staff, salesAmount, profitAmount, departureStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      d.registrationDate || "",
      d.leadPassenger || "",
      d.allPassengers || "",
      d.tourCode || "",
      d.region || "",
      d.departureDate || "",
      d.bookingCode || "",
      d.tourPrice || 0,
      d.discountRemarks || "",
      d.paymentProof || "",
      d.documentReceived || "",
      d.visaProcessStart || "",
      d.visaProcessEnd || "",
      d.documentRemarks || "",
      u.username || "",
      d.salesAmount || 0,
      d.profitAmount || 0,
      d.departureStatus || "PENDING"
    );
    logAction(u, "Menambahkan Tour Baru", d.tourCode);
    res.json({ message: "Tour berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", requireRole("super", "semi"), (req, res) => {
  try {
    const db = getDB();
    const u = req.user;
    const d = req.body;
    db.prepare(`
      UPDATE tours SET
      registrationDate=?, leadPassenger=?, allPassengers=?, tourCode=?, region=?,
      departureDate=?, bookingCode=?, tourPrice=?, discountRemarks=?, paymentProof=?,
      documentReceived=?, visaProcessStart=?, visaProcessEnd=?, documentRemarks=?,
      staff=?, salesAmount=?, profitAmount=?, departureStatus=?
      WHERE id=?
    `).run(
      d.registrationDate || "",
      d.leadPassenger || "",
      d.allPassengers || "",
      d.tourCode || "",
      d.region || "",
      d.departureDate || "",
      d.bookingCode || "",
      d.tourPrice || 0,
      d.discountRemarks || "",
      d.paymentProof || "",
      d.documentReceived || "",
      d.visaProcessStart || "",
      d.visaProcessEnd || "",
      d.documentRemarks || "",
      u.username || "",
      d.salesAmount || 0,
      d.profitAmount || 0,
      d.departureStatus || "PENDING",
      req.params.id
    );
    logAction(u, "Mengubah Data Tour", d.tourCode);
    res.json({ message: "Tour berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireRole("super"), (req, res) => {
  try {
    const db = getDB();
    const u = req.user;
    const t = db.prepare("SELECT tourCode FROM tours WHERE id=?").get(req.params.id);
    if (!t) return res.status(404).json({ error: "Tour tidak ditemukan" });
    db.prepare("DELETE FROM tours WHERE id=?").run(req.params.id);
    logAction(u, "Menghapus Tour", t.tourCode);
    res.json({ message: "Tour dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
