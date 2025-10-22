// ==========================================================
// 💹 Report Sales Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import pkg from "pg";
import ExcelJS from "exceljs";

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 Get all sales (with optional filters)
// ==========================================================
export async function getAllSalesReport(req, res) {
  try {
    const { q, staff, month, category } = req.query;
    let filters = [];
    let values = [];
    let i = 1;

    if (q) {
      filters.push(`(LOWER(invoice_number) LIKE LOWER($${i}) OR LOWER(notes) LIKE LOWER($${i}))`);
      values.push(`%${q}%`);
      i++;
    }
    if (staff) {
      filters.push(`LOWER(staff_name) = LOWER($${i})`);
      values.push(staff);
      i++;
    }
    if (month) {
      filters.push(`TO_CHAR(transaction_date, 'YYYY-MM') = $${i}`);
      values.push(month);
      i++;
    }
    if (category) {
      filters.push(`LOWER(category) = LOWER($${i})`);
      values.push(category);
      i++;
    }

    const whereClause = filters.length ? "WHERE " + filters.join(" AND ") : "";

    const query = `
      SELECT id, transaction_date, invoice_number, staff_name, client_name, 
             sales_amount, profit_amount, category, tour_code, notes
      FROM sales
      ${whereClause}
      ORDER BY transaction_date DESC;
    `;

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error("❌ Sales report query error:", err);
    res.status(500).json({ message: "Gagal memuat data laporan sales." });
  }
}

// ==========================================================
// 🔹 Get sales by staff (used by staff users)
// ==========================================================
export async function getSalesByStaff(req, res) {
  try {
    const { staff_name } = req.params;
    const query = `
      SELECT *
      FROM sales
      WHERE LOWER(staff_name) = LOWER($1)
      ORDER BY transaction_date DESC;
    `;
    const { rows } = await pool.query(query, [staff_name]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Get sales by staff error:", err);
    res.status(500).json({ message: "Gagal memuat data sales untuk staff." });
  }
}

// ==========================================================
// 🔹 Get sales summary (used by dashboard / executive)
// ==========================================================
export async function getSalesSummary(req, res) {
  try {
    const query = `
      SELECT
        SUM(sales_amount) AS total_sales,
        SUM(profit_amount) AS total_profit,
        COUNT(*) AS total_transactions
      FROM sales;
    `;
    const { rows } = await pool.query(query);
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Sales summary error:", err);
    res.status(500).json({ message: "Gagal mengambil ringkasan sales." });
  }
}

// ==========================================================
// 🔹 Export Sales Report to Excel or CSV
// ==========================================================
export async function exportSalesReport(req, res) {
  try {
    const { format = "xlsx", staff, month, category } = req.query;

    let filters = [];
    let values = [];
    let i = 1;

    if (staff) {
      filters.push(`LOWER(staff_name) = LOWER($${i})`);
      values.push(staff);
      i++;
    }
    if (month) {
      filters.push(`TO_CHAR(transaction_date, 'YYYY-MM') = $${i}`);
      values.push(month);
      i++;
    }
    if (category) {
      filters.push(`LOWER(category) = LOWER($${i})`);
      values.push(category);
      i++;
    }

    const whereClause = filters.length ? "WHERE " + filters.join(" AND ") : "";
    const query = `
      SELECT transaction_date, invoice_number, staff_name, client_name,
             sales_amount, profit_amount, category, tour_code, notes
      FROM sales
      ${whereClause}
      ORDER BY transaction_date DESC;
    `;
    const { rows } = await pool.query(query, values);

    if (format === "csv") {
      const header = "Tanggal,Invoice,Staff,Client,Sales,Profit,Kategori,Tour Code,Notes\n";
      const csv = header + rows
        .map(r => [
          r.transaction_date ? new Date(r.transaction_date).toISOString().split("T")[0] : "",
          r.invoice_number || "",
          r.staff_name || "",
          r.client_name || "",
          r.sales_amount || 0,
          r.profit_amount || 0,
          r.category || "",
          r.tour_code || "",
          r.notes || "",
        ].join(","))
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="sales_report.csv"');
      res.send(csv);
    } else {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Sales Report");
      sheet.columns = [
        { header: "Tanggal", key: "transaction_date", width: 15 },
        { header: "Invoice", key: "invoice_number", width: 20 },
        { header: "Staff", key: "staff_name", width: 20 },
        { header: "Client", key: "client_name", width: 20 },
        { header: "Sales (Rp)", key: "sales_amount", width: 15 },
        { header: "Profit (Rp)", key: "profit_amount", width: 15 },
        { header: "Kategori", key: "category", width: 15 },
        { header: "Tour Code", key: "tour_code", width: 15 },
        { header: "Notes", key: "notes", width: 25 },
      ];

      rows.forEach(r => sheet.addRow({
        transaction_date: r.transaction_date ? new Date(r.transaction_date).toISOString().split("T")[0] : "",
        invoice_number: r.invoice_number,
        staff_name: r.staff_name,
        client_name: r.client_name,
        sales_amount: r.sales_amount,
        profit_amount: r.profit_amount,
        category: r.category,
        tour_code: r.tour_code,
        notes: r.notes,
      }));

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="sales_report.xlsx"');
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    console.error("❌ Export sales report error:", err);
    res.status(500).json({ message: "Gagal mengekspor laporan sales." });
  }
}