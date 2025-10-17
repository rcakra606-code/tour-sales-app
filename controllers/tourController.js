// controllers/tourController.js (tambahkan di bawah fungsi lain)
const ExcelJS = require('exceljs');

/**
 * GET /api/tours/export/excel
 * Export tours -> Excel (.xlsx)
 * Optional query: search, page, limit (page/limit akan diabaikan untuk export seluruh data kecuali ingin paginated export)
 */
exports.exportToursExcel = async (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : '%%';
    // ambil semua matching rows (tanpa limit agar export lengkap)
    const rows = db.prepare(
      `SELECT id, registrationDate, leadPassenger, allPassengers, paxCount, tourCode, region, departureDate, bookingCode, tourPrice, discountRemarks, staff, salesAmount, profitAmount, departureStatus
       FROM tours
       WHERE leadPassenger LIKE ? OR tourCode LIKE ? OR region LIKE ?
       ORDER BY registrationDate DESC`
    ).all(search, search, search);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Travel Dashboard';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet('Tours');

    // columns
    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Registration Date', key: 'registrationDate', width: 18 },
      { header: 'Lead Passenger', key: 'leadPassenger', width: 24 },
      { header: 'All Passengers', key: 'allPassengers', width: 40 },
      { header: 'Pax Count', key: 'paxCount', width: 10 },
      { header: 'Tour Code', key: 'tourCode', width: 16 },
      { header: 'Region', key: 'region', width: 14 },
      { header: 'Departure Date', key: 'departureDate', width: 18 },
      { header: 'Booking Code', key: 'bookingCode', width: 18 },
      { header: 'Tour Price', key: 'tourPrice', width: 14 },
      { header: 'Discount Remarks', key: 'discountRemarks', width: 30 },
      { header: 'Staff', key: 'staff', width: 16 },
      { header: 'Sales Amount', key: 'salesAmount', width: 14 },
      { header: 'Profit Amount', key: 'profitAmount', width: 14 },
      { header: 'Departure Status', key: 'departureStatus', width: 14 }
    ];

    // add rows
    rows.forEach(r => {
      sheet.addRow({
        id: r.id,
        registrationDate: r.registrationDate,
        leadPassenger: r.leadPassenger,
        allPassengers: r.allPassengers,
        paxCount: r.paxCount,
        tourCode: r.tourCode,
        region: r.region,
        departureDate: r.departureDate,
        bookingCode: r.bookingCode,
        tourPrice: r.tourPrice,
        discountRemarks: r.discountRemarks,
        staff: r.staff,
        salesAmount: r.salesAmount,
        profitAmount: r.profitAmount,
        departureStatus: r.departureStatus
      });
    });

    // formatting header row
    sheet.getRow(1).font = { bold: true };

    // send file
    const ts = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
    const filename = `tours_export_${ts}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('exportToursExcel error:', err);
    res.status(500).json({ error: 'Gagal mengekspor ke Excel.' });
  }
};

/**
 * GET /api/tours/export/csv
 * Export tours -> CSV
 */
exports.exportToursCSV = (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : '%%';
    const rows = db.prepare(
      `SELECT id, registrationDate, leadPassenger, allPassengers, paxCount, tourCode, region, departureDate, bookingCode, tourPrice, discountRemarks, staff, salesAmount, profitAmount, departureStatus
       FROM tours
       WHERE leadPassenger LIKE ? OR tourCode LIKE ? OR region LIKE ?
       ORDER BY registrationDate DESC`
    ).all(search, search, search);

    const header = [
      'ID','Registration Date','Lead Passenger','All Passengers','Pax Count','Tour Code','Region','Departure Date','Booking Code','Tour Price','Discount Remarks','Staff','Sales Amount','Profit Amount','Departure Status'
    ];

    // Build CSV content
    const escapeCsv = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines = [header.join(',')];
    rows.forEach(r => {
      const line = [
        r.id,
        r.registrationDate,
        r.leadPassenger,
        r.allPassengers,
        r.paxCount,
        r.tourCode,
        r.region,
        r.departureDate,
        r.bookingCode,
        r.tourPrice,
        r.discountRemarks,
        r.staff,
        r.salesAmount,
        r.profitAmount,
        r.departureStatus
      ].map(escapeCsv).join(',');
      lines.push(line);
    });

    const csv = lines.join('\n');
    const ts = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
    const filename = `tours_export_${ts}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error('exportToursCSV error:', err);
    res.status(500).json({ error: 'Gagal mengekspor ke CSV.' });
  }
};
