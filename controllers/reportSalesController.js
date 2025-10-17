// controllers/reportSalesController.js — Final Version (Role-Based CRUD + Export)
const path = require("path");
const Database = require("better-sqlite3");
const ExcelJS = require("exceljs");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/* ===========================================================
   📋 GET /api/report/sales
   Semua user bisa lihat, tapi basic hanya data miliknya
=========================================================== */
exports.getReports = (req, res) => {
  try {
    const user = req.user;
    const search = req.query.search ? `%${req.query.search}%` : "%%";
    let rows = [];

    if (user.type === "basic") {
      rows = db
        .prepare(
          `SELECT * FROM report_sales 
           WHERE staff = ? AND (transactionDate LIKE ?) 
           ORDER BY transactionDate DESC`
        )
        .all(user.username, search);
    } else {
      rows = db
        .prepare(
          `SELECT * FROM report_sales 
           WHERE transactionDate LIKE ? 
           ORDER BY transactionDate DESC`
        )
        .all(search);
    }

    res.json(rows);
  } catch (err) {
    console.error("getReports error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data laporan sales." });
  }
};

/* ===========================================================
   ➕ POST /api/report/sales
   Hanya Admin & Semi Admin bisa tambah data
=========================================================== */
exports.createReport = (req, res) => {
  try {
    const user = req.user;
    if (user.type === "basic")
      return res.status(403).json({ error: "Anda tidak memiliki izin menambah data sales." });

    const data = req.body;
    db.prepare(
      `INSERT INTO report_sales (
        reportDate, transactionDate, totalInvoices, salesAmount, profitAmount, staff
      ) VALUES (?,?,?,?,?,?)`
    ).run(
      data.reportDate || new Date().toISOString().split("T")[0],
      data.transactionDate || "",
      data.totalInvoices || 0,
      data.salesAmount || 0,
      data.profitAmount || 0,
      data.staff || user.username
    );

    res.json({ ok: true, message: "Laporan sales berhasil ditambahkan." });
  } catch (err) {
    console.error("createReport error:", err.message);
    res.status(500).json({ error: "Gagal menambah laporan sales." });
  }
};

/* ===========================================================
   ✏️ PUT /api/report/sales/:id
   Hanya Admin & Semi Admin bisa edit data
=========================================================== */
exports.updateReport = (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (user.type === "basic")
      return res.status(403).json({ error: "Anda tidak memiliki izin mengubah data sales." });

    const existing = db.prepare("SELECT * FROM report_sales WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ error: "Data tidak ditemukan." });

    const data = req.body;
    db.prepare(
      `UPDATE report_sales 
       SET reportDate=?, transactionDate=?, totalInvoices=?, salesAmount=?, profitAmount=?, staff=? 
       WHERE id=?`
    ).run(
      data.reportDate || existing.reportDate,
      data.transactionDate || existing.transactionDate,
      data.totalInvoices || existing.totalInvoices,
      data.salesAmount || existing.salesAmount,
      data.profitAmount || existing.profitAmount,
      data.staff || existing.staff,
      id
    );

    res.json({ ok: true, message: "Laporan sales berhasil diperbarui." });
  } catch (err) {
    console.error("updateReport error:", err.message);
    res.status(500).json({ error: "Gagal memperbarui laporan sales." });
  }
};

/* ===========================================================
   🗑️ DELETE /api/report/sales/:id
   Hanya Admin & Semi Admin bisa hapus data
=========================================================== */
exports.deleteReport = (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (user.type === "basic")
      return res.status(403).json({ error: "Anda tidak memiliki izin menghapus data sales." });

    const existing = db.prepare("SELECT * FROM report_sales WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ error: "Data tidak ditemukan." });

    db.prepare("DELETE FROM report_sales WHERE id = ?").run(id);
    res.json({ ok: true, message: "Laporan sales dihapus." });
  } catch (err) {
    console.error("deleteReport error:", err.message);
    res.status(500).json({ error: "Gagal menghapus laporan sales." });
  }
};

/* ===========================================================
   📊 GET /api/report/sales/summary
   Statistik total sales & profit
=========================================================== */
exports.getSummary = (req, res) => {
  try {
    const user = req.user;
    let condition = "";
    let param = [];

    if (user.type === "basic") {
      condition = "WHERE staff = ?";
      param.push(user.username);
    }

    const totalSales = db.prepare(`SELECT SUM(salesAmount) AS total FROM report_sales ${condition}`).get(...param).total || 0;
    const totalProfit = db.prepare(`SELECT SUM(profitAmount) AS total FROM report_sales ${condition}`).get(...param).total || 0;
    const totalInvoices = db.prepare(`SELECT SUM(totalInvoices) AS total FROM report_sales ${condition}`).get(...param).total || 0;

    const byStaff = db.prepare(`SELECT staff, SUM(salesAmount) AS totalSales, SUM(profitAmount) AS totalProfit 
      FROM report_sales ${condition} GROUP BY staff`).all(...param);

    res.json({ totalSales, totalProfit, totalInvoices, byStaff });
  } catch (err) {
    console.error("getSummary error:", err.message);
    res.status(500).json({ error: "Gagal mengambil ringkasan laporan sales." });
  }
};

/* ===========================================================
   📤 GET /api/report/sales/export/excel
=========================================================== */
exports.exportExcel = async (req, res) => {
  try {
    const user = req.user;
    const rows =
      user.type === "basic"
        ? db.prepare("SELECT * FROM report_sales WHERE staff = ?").all(user.username)
        : db.prepare("SELECT * FROM report_sales").all();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales Reports");

    sheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Tanggal Transaksi", key: "transactionDate", width: 18 },
      { header: "Jumlah Invoice", key: "totalInvoices", width: 15 },
      { header: "Total Sales (IDR)", key: "salesAmount", width: 20 },
      { header: "Total Profit (IDR)", key: "profitAmount", width: 20 },
      { header: "Staff", key: "staff", width: 15 },
    ];

    rows.forEach(r => sheet.addRow(r));
    sheet.getRow(1).font = { bold: true };

    const ts = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Disposition", `attachment; filename="sales_report_${ts}.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportExcel error:", err.message);
    res.status(500).json({ error: "Gagal mengekspor laporan sales." });
  }
};
