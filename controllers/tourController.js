/**
 * ==========================================================
 * controllers/tourController.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ CRUD data Tour
 * ✅ Kolom lengkap sesuai form input
 * ✅ Export ke Excel (XLSX)
 * ✅ Integrasi logger & keamanan
 * ==========================================================
 */

const db = require("../config/database");
const logger = require("../config/logger");
const ExcelJS = require("exceljs");

// ============================================================
// 📘 GET /api/tours
// Ambil semua data tour
// ============================================================
exports.getAllTours = async (req, res) => {
  try {
    const result = await db.all("SELECT * FROM tours ORDER BY registrationDate DESC");
    res.json(result);
  } catch (err) {
    logger.error("❌ Error fetching tours:", err);
    res.status(500).json({ message: "Gagal mengambil data tour" });
  }
};

// ============================================================
// 📘 GET /api/tours/:id
// Ambil 1 data tour berdasarkan ID
// ============================================================
exports.getTourById = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await db.get("SELECT * FROM tours WHERE id = ?", [id]);
    if (!tour) return res.status(404).json({ message: "Data tour tidak ditemukan" });
    res.json(tour);
  } catch (err) {
    logger.error("❌ Error fetching tour by ID:", err);
    res.status(500).json({ message: "Gagal mengambil data tour" });
  }
};

// ============================================================
// 🟢 POST /api/tours
// Tambah data tour baru
// ============================================================
exports.createTour = async (req, res) => {
  try {
    const data = req.body;
    await db.run(
      `INSERT INTO tours 
      (registrationDate, leadPassenger, allPassengers, tourCode, region, departureDate, bookingCode, tourPrice, discountRemarks, paymentProof, documentReceived, visaProcessStart, visaProcessEnd, documentRemarks, staff, salesAmount, profitAmount, departureStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.registrationDate,
        data.leadPassenger,
        data.allPassengers,
        data.tourCode,
        data.region,
        data.departureDate,
        data.bookingCode,
        data.tourPrice || 0,
        data.discountRemarks,
        data.paymentProof,
        data.documentReceived,
        data.visaProcessStart,
        data.visaProcessEnd,
        data.documentRemarks,
        data.staff,
        data.salesAmount || 0,
        data.profitAmount || 0,
        data.departureStatus || "PENDING",
      ]
    );
    logger.info(`✅ Tour ditambahkan oleh ${data.staff || "unknown"}`);
    res.json({ message: "✅ Data tour berhasil ditambahkan" });
  } catch (err) {
    logger.error("❌ Error creating tour:", err);
    res.status(500).json({ message: "Gagal menambahkan data tour" });
  }
};

// ============================================================
// 🟡 PUT /api/tours/:id
// Update data tour
// ============================================================
exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await db.get("SELECT id FROM tours WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ message: "Data tour tidak ditemukan" });

    await db.run(
      `UPDATE tours 
       SET registrationDate=?, leadPassenger=?, allPassengers=?, tourCode=?, region=?, departureDate=?, bookingCode=?, tourPrice=?, discountRemarks=?, paymentProof=?, documentReceived=?, visaProcessStart=?, visaProcessEnd=?, documentRemarks=?, staff=?, salesAmount=?, profitAmount=?, departureStatus=? 
       WHERE id=?`,
      [
        data.registrationDate,
        data.leadPassenger,
        data.allPassengers,
        data.tourCode,
        data.region,
        data.departureDate,
        data.bookingCode,
        data.tourPrice || 0,
        data.discountRemarks,
        data.paymentProof,
        data.documentReceived,
        data.visaProcessStart,
        data.visaProcessEnd,
        data.documentRemarks,
        data.staff,
        data.salesAmount || 0,
        data.profitAmount || 0,
        data.departureStatus || "PENDING",
        id,
      ]
    );

    logger.info(`✏️ Tour ID ${id} diperbarui oleh ${data.staff || "unknown"}`);
    res.json({ message: "✅ Data tour berhasil diperbarui" });
  } catch (err) {
    logger.error("❌ Error updating tour:", err);
    res.status(500).json({ message: "Gagal memperbarui data tour" });
  }
};

// ============================================================
// 🔴 DELETE /api/tours/:id
// Hapus data tour
// ============================================================
exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.get("SELECT id FROM tours WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ message: "Data tour tidak ditemukan" });

    await db.run("DELETE FROM tours WHERE id = ?", [id]);
    logger.info(`🗑️ Tour ID ${id} dihapus`);
    res.json({ message: "✅ Data tour berhasil dihapus" });
  } catch (err) {
    logger.error("❌ Error deleting tour:", err);
    res.status(500).json({ message: "Gagal menghapus data tour" });
  }
};

// ============================================================
// 📤 GET /api/tours/export
// Export data tour ke Excel
// ============================================================
exports.exportTourReport = async (req, res) => {
  try {
    const filename = `Tour_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tour Data");

    const data = await db.all("SELECT * FROM tours ORDER BY registrationDate DESC");

    worksheet.columns = [
      { header: "Tanggal Registrasi", key: "registrationDate", width: 18 },
      { header: "Lead Passenger", key: "leadPassenger", width: 20 },
      { header: "All Passengers", key: "allPassengers", width: 25 },
      { header: "Tour Code", key: "tourCode", width: 15 },
      { header: "Region", key: "region", width: 15 },
      { header: "Departure Date", key: "departureDate", width: 18 },
      { header: "Booking Code", key: "bookingCode", width: 15 },
      { header: "Tour Price", key: "tourPrice", width: 15 },
      { header: "Discount Remarks", key: "discountRemarks", width: 20 },
      { header: "Payment Proof", key: "paymentProof", width: 20 },
      { header: "Document Received", key: "documentReceived", width: 18 },
      { header: "Visa Process Start", key: "visaProcessStart", width: 18 },
      { header: "Visa Process End", key: "visaProcessEnd", width: 18 },
      { header: "Document Remarks", key: "documentRemarks", width: 20 },
      { header: "Staff", key: "staff", width: 15 },
      { header: "Sales Amount", key: "salesAmount", width: 15 },
      { header: "Profit Amount", key: "profitAmount", width: 15 },
      { header: "Departure Status", key: "departureStatus", width: 15 },
    ];

    data.forEach((row) => worksheet.addRow(row));
    worksheet.getRow(1).font = { bold: true };

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    await workbook.xlsx.write(res);
    res.end();

    logger.info(`📁 Exported Tour Report: ${filename}`);
  } catch (err) {
    logger.error("❌ Error exporting tour report:", err);
    res.status(500).json({ message: "Gagal mengekspor data tour" });
  }
};
