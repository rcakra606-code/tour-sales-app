// controllers/salesController.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * GET /api/sales
 * Return list of all sales (admin & semiadmin), or only own sales (staff)
 */
export async function getSales(req, res) {
  try {
    const role = req.user.role;
    const staff = req.user.staff_name || req.user.username;

    let q = `SELECT id, transaction_date, staff_name, invoice_number, sales_amount, profit_amount, remarks 
             FROM sales `;
    if (role === "staff") {
      q += `WHERE LOWER(staff_name) = LOWER($1) ORDER BY transaction_date DESC`;
    } else {
      q += `ORDER BY transaction_date DESC`;
    }

    const values = role === "staff" ? [staff] : [];
    const { rows } = await pool.query(q, values);

    const formatted = rows.map((r) => ({
      id: r.id,
      transactionDate: r.transaction_date,
      staffName: r.staff_name,
      invoiceNumber: r.invoice_number,
      salesAmount: parseFloat(r.sales_amount) || 0,
      profitAmount: parseFloat(r.profit_amount) || 0,
      remarks: r.remarks,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ GET /api/sales error:", err);
    res.status(500).json({ message: "Gagal memuat data sales" });
  }
}

/**
 * POST /api/sales
 * Create new sales record
 */
export async function createSale(req, res) {
  try {
    const { transactionDate, staffName, invoiceNumber, salesAmount, profitAmount, remarks } = req.body;

    if (!transactionDate || !staffName) {
      return res.status(400).json({ message: "Tanggal transaksi dan nama staff wajib diisi" });
    }

    const q = `
      INSERT INTO sales (transaction_date, staff_name, invoice_number, sales_amount, profit_amount, remarks)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, staff_name, invoice_number, sales_amount, profit_amount, remarks;
    `;
    const values = [transactionDate, staffName, invoiceNumber, salesAmount, profitAmount, remarks];

    const { rows } = await pool.query(q, values);
    res.status(201).json({
      message: "Data sales berhasil disimpan",
      data: rows[0],
    });
  } catch (err) {
    console.error("❌ POST /api/sales error:", err);
    res.status(500).json({ message: "Gagal menyimpan data sales" });
  }
}

/**
 * DELETE /api/sales/:id
 * Delete a sales record by ID (Admin or SemiAdmin only)
 */
export async function deleteSale(req, res) {
  try {
    const role = req.user.role;
    if (!["admin", "semiadmin"].includes(role)) {
      return res.status(403).json({ message: "Akses ditolak. Hanya Admin atau SemiAdmin yang dapat menghapus." });
    }

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID tidak valid" });

    await pool.query(`DELETE FROM sales WHERE id = $1;`, [id]);
    res.json({ message: "Data sales berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE /api/sales error:", err);
    res.status(500).json({ message: "Gagal menghapus data sales" });
  }
}