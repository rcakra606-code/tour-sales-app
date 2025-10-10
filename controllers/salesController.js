// =====================================
// ✅ SALES CONTROLLER
// =====================================
const path = require('path');
const fs = require('fs');

// File database sederhana (pakai JSON di local)
const DB_PATH = path.join(__dirname, '..', 'data', 'sales.json');

// ==========================
// 🔹 Helper untuk baca / tulis file JSON
// ==========================
function readSalesFile() {
  if (!fs.existsSync(DB_PATH)) return [];
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('❌ Gagal membaca sales.json:', err);
    return [];
  }
}

function writeSalesFile(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Gagal menulis sales.json:', err);
  }
}

// ==========================
// ✅ GET /api/sales
// ==========================
exports.getAllSales = (req, res) => {
  try {
    const sales = readSalesFile();

    // Jika admin, tampilkan semua; jika staff, filter per staff_name
    const user = req.user;
    const filtered = user.role === 'admin'
      ? sales
      : sales.filter(s => s.staff_name === user.username);

    res.json({ sales: filtered });
  } catch (err) {
    console.error('Gagal mengambil data sales:', err);
    res.status(500).json({ message: 'Gagal mengambil data sales.' });
  }
};

// ==========================
// ✅ POST /api/sales
// ==========================
exports.createSales = (req, res) => {
  try {
    const {
      transaction_date,
      invoice_number,
      sales_amount,
      profit_amount,
      discount_amount,
      discount_remarks,
      staff_name
    } = req.body;

    if (!transaction_date || !invoice_number || !sales_amount) {
      return res.status(400).json({ message: 'Data penjualan tidak lengkap.' });
    }

    const sales = readSalesFile();

    // Buat ID baru otomatis
    const newId = sales.length > 0 ? sales[sales.length - 1].id + 1 : 1;

    const newSale = {
      id: newId,
      transaction_date,
      invoice_number,
      sales_amount: parseFloat(sales_amount),
      profit_amount: parseFloat(profit_amount) || 0,
      discount_amount: parseFloat(discount_amount) || 0,
      discount_remarks: discount_remarks || '',
      staff_name: staff_name || req.user.username,
      created_at: new Date().toISOString()
    };

    sales.push(newSale);
    writeSalesFile(sales);

    res.status(201).json({
      message: 'Data sales berhasil ditambahkan.',
      sale: newSale
    });
  } catch (err) {
    console.error('Gagal membuat data sales:', err);
    res.status(500).json({ message: 'Gagal membuat data sales.' });
  }
};
