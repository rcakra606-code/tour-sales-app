// controllers/documentController.js
const db = require("../config/database");

exports.create = (req, res) => {
  try {
    const b = req.body;
    const insert = db.prepare(`INSERT INTO documents
      (documentReceiveDate,shipmentDate,guestNames,passportVisa,processType,bookingCodeDMS,invoiceNumber,guestPhone,estimatedCompletion,tourType,tourCode,tourDepartureDate,passportUsageDate,passportReceivedDate,documentStatus,visaStatus,remarks)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const info = insert.run(
      b.documentReceiveDate, b.shipmentDate, b.guestNames, b.passportVisa, b.processType, b.bookingCodeDMS, b.invoiceNumber, b.guestPhone, b.estimatedCompletion, b.tourType, b.tourCode, b.tourDepartureDate, b.passportUsageDate, b.passportReceivedDate, b.documentStatus, b.visaStatus, b.remarks
    );
    res.json({ id: info.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.list = (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM documents ORDER BY documentReceiveDate DESC").all();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
