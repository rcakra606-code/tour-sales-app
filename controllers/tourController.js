// =====================================
// ✅ TOURS CONTROLLER
// =====================================
const path = require('path');
const fs = require('fs');

// Database lokal (disimpan sebagai JSON)
const DB_PATH = path.join(__dirname, '..', 'data', 'tours.json');

// ==========================
// 🔹 Helper baca / tulis file JSON
// ==========================
function readToursFile() {
  if (!fs.existsSync(DB_PATH)) return [];
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('❌ Gagal membaca tours.json:', err);
    return [];
  }
}

function writeToursFile(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Gagal menulis tours.json:', err);
  }
}

// ==========================
// ✅ GET /api/tours
// ==========================
exports.getAllTours = (req, res) => {
  try {
    const tours = readToursFile();

    // Filter sesuai role user
    const user = req.user;
    const filtered = user.role === 'admin'
      ? tours
      : tours.filter(t => t.created_by === user.username);

    res.json({ tours: filtered });
  } catch (err) {
    console.error('Gagal mengambil data tours:', err);
    res.status(500).json({ message: 'Gagal mengambil data tour.' });
  }
};

// ==========================
// ✅ POST /api/tours
// ==========================
exports.createTour = (req, res) => {
  try {
    const {
      reg_date,
      lead_passenger,
      all_passengers,
      pax_count,
      tour_code,
      region,
      departure_date,
      booking_code,
      price,
      departure_status
    } = req.body;

    if (!lead_passenger || !tour_code || !region) {
      return res.status(400).json({ message: 'Data tour tidak lengkap.' });
    }

    const tours = readToursFile();
    const newId = tours.length > 0 ? tours[tours.length - 1].id + 1 : 1;

    const newTour = {
      id: newId,
      reg_date: reg_date || new Date().toISOString().split('T')[0],
      lead_passenger,
      all_passengers: all_passengers || '',
      pax_count: parseInt(pax_count) || 0,
      tour_code,
      region,
      departure_date: departure_date || '',
      booking_code: booking_code || '',
      price: parseFloat(price) || 0,
      departure_status: departure_status || 'pending',
      created_by: req.user.username,
      created_at: new Date().toISOString(),
    };

    tours.push(newTour);
    writeToursFile(tours);

    res.status(201).json({
      message: 'Data tour berhasil ditambahkan.',
      tour: newTour
    });
  } catch (err) {
    console.error('Gagal membuat data tour:', err);
    res.status(500).json({ message: 'Gagal membuat data tour.' });
  }
};
