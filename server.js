// server.js
// Express server integrated with sqlite (better-sqlite3), JWT auth, CSP headers, and CRUD endpoints.
// Requirements: node >= 16
// Dependencies: express, better-sqlite3, bcryptjs, jsonwebtoken, helmet, express-rate-limit, morgan, cors

const path = require('path');
const fs = require('fs');
const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'database.db');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '8h'; // token lifetime

// --- Basic middlewares ---
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(morgan('tiny'));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many requests, slow down.' }
});
app.use('/api/auth', authLimiter);

// CORS: allow your frontend host; default allow all for dev (change in prod)
app.use(cors({
  origin: (origin, cb) => {
    // allow if undefined (same origin like curl) or localhost/dev
    cb(null, true);
  }
}));

// Helmet with CSP tailored to the provided frontend
app.use(helmet({
  contentSecurityPolicy: false // We'll set CSP manually to include inline and CDNs
}));

// Custom CSP header that allows inline (because frontend contains inline script tags)
// In production you should move inline scripts to external files and use nonces.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
  "img-src 'self' data: https://*",
  "connect-src 'self' https://*",
  "font-src 'self' https://fonts.gstatic.com data:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'"
];
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  // Additional recommended security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});

// Serve static files (your frontend)
/* Ensure you have public/index.html (the TARGET FRONT END file) */
app.use(express.static(path.join(__dirname, 'public')));

// --- Database init ---
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, '');
}
const db = new Database(DB_FILE);

// Initialize tables if not exist
function initTables() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      email TEXT,
      type TEXT NOT NULL DEFAULT 'basic', -- basic | semi | super
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registration_date TEXT NOT NULL,
      lead_passenger TEXT,
      all_passengers TEXT,
      pax_count INTEGER DEFAULT 0,
      tour_code TEXT,
      region_id INTEGER,
      departure_date TEXT,
      booking_code TEXT,
      tour_price INTEGER DEFAULT 0,
      discount_remarks TEXT,
      payment_proof TEXT,
      document_received TEXT,
      visa_process_start TEXT,
      visa_process_end TEXT,
      document_remarks TEXT,
      staff_username TEXT,
      sales_amount INTEGER DEFAULT 0,
      profit_amount INTEGER DEFAULT 0,
      departure_status TEXT DEFAULT 'belum_jalan',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(region_id) REFERENCES regions(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_date TEXT NOT NULL,
      invoice_number TEXT,
      sales_amount INTEGER DEFAULT 0,
      profit_amount INTEGER DEFAULT 0,
      discount_amount INTEGER DEFAULT 0,
      discount_remarks TEXT,
      staff_username TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_receive_date TEXT,
      shipment_date TEXT,
      guest_names TEXT,
      passport_visa TEXT,
      process_type TEXT,
      booking_code_dms TEXT,
      invoice_number TEXT,
      guest_phone TEXT,
      estimated_completion TEXT,
      tour_type TEXT,
      tour_code TEXT,
      tour_departure_date TEXT,
      passport_usage_date TEXT,
      passport_received_date TEXT,
      document_status TEXT,
      visa_status TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tours_staff ON tours(staff_username);
    CREATE INDEX IF NOT EXISTS idx_sales_staff ON sales(staff_username);
    CREATE INDEX IF NOT EXISTS idx_tours_region ON tours(region_id);
  `);

  // Ensure at least one super admin exists (demo)
  const row = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!row) {
    const pw = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password, name, email, type) VALUES (?, ?, ?, ?, ?)').run('admin', pw, 'Administrator', 'admin@company.com', 'super');
  }

  // default regions
  const countRegions = db.prepare('SELECT COUNT(1) as c FROM regions').get().c;
  if (countRegions === 0) {
    const insert = db.prepare('INSERT INTO regions (name) VALUES (?)');
    ['Asia', 'Eropa', 'Amerika', 'Australia', 'Afrika'].forEach(r => insert.run(r));
  }
}
initTables();

// --- Utilities ---
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// Middleware: authenticate JWT (optional: allow anonymous for certain GETs)
function authenticateJWT(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No authorization token' });
  const token = auth.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  req.user = payload;
  next();
}

function authorizeRoles(...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowed.includes(req.user.type)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// --- Auth routes ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });

  const row = db.prepare('SELECT id, username, password, name, email, type FROM users WHERE username = ?').get(username);
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = bcrypt.compareSync(password, row.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  // sign token
  const token = signToken({ id: row.id, username: row.username, name: row.name, email: row.email, type: row.type });
  res.json({ token, user: { username: row.username, name: row.name, email: row.email, type: row.type } });
});

// Verify
app.get('/api/auth/verify', (req, res) => {
  const header = req.headers.authorization;
  if (!header) return res.json({ ok: false });
  const token = header.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return res.json({ ok: false });
  res.json({ ok: true, user: payload });
});

// --- Dashboard summary (aggregated) ---
app.get('/api/dashboard/summary', authenticateJWT, (req, res) => {
  // Only authenticated users can see summary
  // If user is basic, restrict to their staff data
  const isBasic = req.user.type === 'basic';
  const staff = isBasic ? req.user.username : null;

  const params = isBasic ? [staff] : [];
  // total sales (tours sales_amount) & profit
  const totalSales = db.prepare(isBasic
    ? `SELECT IFNULL(SUM(sales_amount),0) as total FROM tours WHERE staff_username = ?`
    : `SELECT IFNULL(SUM(sales_amount),0) as total FROM tours`).get(...params).total;

  const totalProfit = db.prepare(isBasic
    ? `SELECT IFNULL(SUM(profit_amount),0) as total FROM tours WHERE staff_username = ?`
    : `SELECT IFNULL(SUM(profit_amount),0) as total FROM tours`).get(...params).total;

  const totalRegistrants = db.prepare(isBasic
    ? `SELECT COUNT(1) as c FROM tours WHERE staff_username = ?`
    : `SELECT COUNT(1) as c FROM tours`).get(...params).c;

  const totalPax = db.prepare(isBasic
    ? `SELECT IFNULL(SUM(pax_count),0) as total FROM tours WHERE staff_username = ?`
    : `SELECT IFNULL(SUM(pax_count),0) as total FROM tours`).get(...params).total;

  // simple region counts
  const regionRows = db.prepare(`
    SELECT r.name, COUNT(t.id) as count
    FROM regions r
    LEFT JOIN tours t ON t.region_id = r.id
    GROUP BY r.id
  `).all();

  res.json({
    totalSales,
    totalProfit,
    totalRegistrants,
    totalPax,
    regions: regionRows
  });
});

// --- Tours CRUD ---
app.get('/api/tours', authenticateJWT, (req, res) => {
  // optional filters: startDate,endDate,staff,region
  const { startDate, endDate, staff, region } = req.query;
  let sql = `SELECT t.*, r.name as region FROM tours t LEFT JOIN regions r ON r.id = t.region_id WHERE 1=1`;
  const params = [];
  if (startDate) { sql += ' AND registration_date >= ?'; params.push(startDate); }
  if (endDate) { sql += ' AND registration_date <= ?'; params.push(endDate); }
  if (staff) { sql += ' AND t.staff_username = ?'; params.push(staff); }
  if (region) { sql += ' AND r.name = ?'; params.push(region); }

  const rows = db.prepare(sql + ' ORDER BY t.registration_date DESC').all(...params);
  res.json(rows);
});

app.get('/api/tours/:id', authenticateJWT, (req, res) => {
  const id = req.params.id;
  const row = db.prepare('SELECT t.*, r.name as region FROM tours t LEFT JOIN regions r ON r.id = t.region_id WHERE t.id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

app.post('/api/tours', authenticateJWT, (req, res) => {
  const data = req.body || {};
  // basic validation
  if (!data.registration_date || !data.tour_code) return res.status(400).json({ error: 'registration_date & tour_code required' });

  // resolve region id from name if provided
  let region_id = null;
  if (data.region) {
    const regionRow = db.prepare('SELECT id FROM regions WHERE name = ?').get(data.region);
    if (regionRow) region_id = regionRow.id;
    else {
      const info = db.prepare('INSERT INTO regions (name) VALUES (?)').run(data.region);
      region_id = info.lastInsertRowid;
    }
  }

  const st = db.prepare(`INSERT INTO tours (
    registration_date, lead_passenger, all_passengers, pax_count, tour_code, region_id,
    departure_date, booking_code, tour_price, discount_remarks, payment_proof,
    document_received, visa_process_start, visa_process_end, document_remarks,
    staff_username, sales_amount, profit_amount, departure_status
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

  const info = st.run(
    data.registration_date,
    data.lead_passenger || '',
    data.all_passengers || '',
    Number(data.pax_count || 0),
    data.tour_code,
    region_id,
    data.departure_date || null,
    data.booking_code || null,
    Number(data.tour_price || 0),
    data.discount_remarks || '',
    data.payment_proof || '',
    data.document_received || null,
    data.visa_process_start || null,
    data.visa_process_end || null,
    data.document_remarks || '',
    data.staff_username || req.user.username,
    Number(data.sales_amount || data.tour_price || 0),
    Number(data.profit_amount || Math.round((data.tour_price || 0) * 0.2)),
    data.departure_status || 'belum_jalan'
  );

  const created = db.prepare('SELECT t.*, r.name as region FROM tours t LEFT JOIN regions r ON r.id = t.region_id WHERE t.id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

app.put('/api/tours/:id', authenticateJWT, (req, res) => {
  const id = req.params.id;
  const prev = db.prepare('SELECT * FROM tours WHERE id = ?').get(id);
  if (!prev) return res.status(404).json({ error: 'Not found' });

  const data = req.body || {};
  let region_id = prev.region_id;
  if (data.region) {
    const r = db.prepare('SELECT id FROM regions WHERE name = ?').get(data.region);
    if (r) region_id = r.id;
    else region_id = db.prepare('INSERT INTO regions (name) VALUES (?)').run(data.region).lastInsertRowid;
  }

  db.prepare(`UPDATE tours SET
    registration_date = ?, lead_passenger = ?, all_passengers = ?, pax_count = ?, tour_code = ?, region_id = ?,
    departure_date = ?, booking_code = ?, tour_price = ?, discount_remarks = ?, payment_proof = ?,
    document_received = ?, visa_process_start = ?, visa_process_end = ?, document_remarks = ?, staff_username = ?,
    sales_amount = ?, profit_amount = ?, departure_status = ?
    WHERE id = ?`).run(
    data.registration_date || prev.registration_date,
    data.lead_passenger || prev.lead_passenger,
    data.all_passengers || prev.all_passengers,
    Number(data.pax_count ?? prev.pax_count),
    data.tour_code || prev.tour_code,
    region_id,
    data.departure_date || prev.departure_date,
    data.booking_code || prev.booking_code,
    Number(data.tour_price ?? prev.tour_price),
    data.discount_remarks ?? prev.discount_remarks,
    data.payment_proof ?? prev.payment_proof,
    data.document_received ?? prev.document_received,
    data.visa_process_start ?? prev.visa_process_start,
    data.visa_process_end ?? prev.visa_process_end,
    data.document_remarks ?? prev.document_remarks,
    data.staff_username ?? prev.staff_username,
    Number(data.sales_amount ?? prev.sales_amount),
    Number(data.profit_amount ?? prev.profit_amount),
    data.departure_status ?? prev.departure_status,
    id
  );

  const updated = db.prepare('SELECT t.*, r.name as region FROM tours t LEFT JOIN regions r ON r.id = t.region_id WHERE t.id = ?').get(id);
  res.json(updated);
});

app.delete('/api/tours/:id', authenticateJWT, authorizeRoles('super','semi'), (req, res) => {
  const id = req.params.id;
  const info = db.prepare('DELETE FROM tours WHERE id = ?').run(id);
  res.json({ deleted: info.changes === 1 });
});

// --- Sales CRUD ---
app.get('/api/sales', authenticateJWT, (req, res) => {
  const isBasic = req.user.type === 'basic';
  const staff = isBasic ? req.user.username : req.query.staff;
  let sql = 'SELECT * FROM sales WHERE 1=1';
  const p = [];
  if (staff) { sql += ' AND staff_username = ?'; p.push(staff); }
  if (req.query.startDate) { sql += ' AND transaction_date >= ?'; p.push(req.query.startDate); }
  if (req.query.endDate) { sql += ' AND transaction_date <= ?'; p.push(req.query.endDate); }
  sql += ' ORDER BY transaction_date DESC';
  const rows = db.prepare(sql).all(...p);
  res.json(rows);
});

app.post('/api/sales', authenticateJWT, (req, res) => {
  const d = req.body || {};
  if (!d.transaction_date || !d.invoice_number) return res.status(400).json({ error: 'transaction_date & invoice_number required' });
  const info = db.prepare(`INSERT INTO sales (
    transaction_date, invoice_number, sales_amount, profit_amount, discount_amount, discount_remarks, staff_username
  ) VALUES (?,?,?,?,?,?,?)`).run(
    d.transaction_date,
    d.invoice_number,
    Number(d.sales_amount || 0),
    Number(d.profit_amount || 0),
    Number(d.discount_amount || 0),
    d.discount_remarks || '',
    d.staff_username || req.user.username
  );
  res.status(201).json(db.prepare('SELECT * FROM sales WHERE id = ?').get(info.lastInsertRowid));
});

app.put('/api/sales/:id', authenticateJWT, (req, res) => {
  const id = req.params.id;
  const prev = db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
  if (!prev) return res.status(404).json({ error: 'Not found' });
  const d = req.body || {};
  db.prepare(`
    UPDATE sales SET transaction_date=?, invoice_number=?, sales_amount=?, profit_amount=?, discount_amount=?, discount_remarks=?, staff_username=?
    WHERE id = ?
  `).run(
    d.transaction_date || prev.transaction_date,
    d.invoice_number || prev.invoice_number,
    Number(d.sales_amount ?? prev.sales_amount),
    Number(d.profit_amount ?? prev.profit_amount),
    Number(d.discount_amount ?? prev.discount_amount),
    d.discount_remarks ?? prev.discount_remarks,
    d.staff_username ?? prev.staff_username,
    id
  );
  res.json(db.prepare('SELECT * FROM sales WHERE id = ?').get(id));
});

app.delete('/api/sales/:id', authenticateJWT, authorizeRoles('super','semi'), (req, res) => {
  const info = db.prepare('DELETE FROM sales WHERE id = ?').run(req.params.id);
  res.json({ deleted: info.changes === 1 });
});

// --- Documents CRUD ---
app.get('/api/documents', authenticateJWT, (req, res) => {
  let sql = 'SELECT * FROM documents WHERE 1=1';
  const p = [];
  ['processType','tourType','documentStatus','visaStatus'].forEach(q => {
    if (req.query[q]) { sql += ` AND ${q} = ?`; p.push(req.query[q]); }
  });
  if (req.query.startDate) { sql += ' AND document_receive_date >= ?'; p.push(req.query.startDate); }
  if (req.query.endDate) { sql += ' AND document_receive_date <= ?'; p.push(req.query.endDate); }
  sql += ' ORDER BY document_receive_date DESC';
  const rows = db.prepare(sql).all(...p);
  res.json(rows);
});

app.post('/api/documents', authenticateJWT, (req, res) => {
  const d = req.body || {};
  const info = db.prepare(`INSERT INTO documents (
    document_receive_date, shipment_date, guest_names, passport_visa, process_type,
    booking_code_dms, invoice_number, guest_phone, estimated_completion, tour_type,
    tour_code, tour_departure_date, passport_usage_date, passport_received_date,
    document_status, visa_status
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    d.document_receive_date || null,
    d.shipment_date || null,
    d.guest_names || '',
    d.passport_visa || '',
    d.process_type || '',
    d.booking_code_dms || '',
    d.invoice_number || '',
    d.guest_phone || '',
    d.estimated_completion || null,
    d.tour_type || '',
    d.tour_code || '',
    d.tour_departure_date || null,
    d.passport_usage_date || null,
    d.passport_received_date || null,
    d.document_status || 'diterima',
    d.visa_status || ''
  );
  res.status(201).json(db.prepare('SELECT * FROM documents WHERE id = ?').get(info.lastInsertRowid));
});

app.put('/api/documents/:id', authenticateJWT, (req, res) => {
  const id = req.params.id;
  const prev = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
  if (!prev) return res.status(404).json({ error: 'Not found' });
  const d = req.body || {};
  db.prepare(`UPDATE documents SET
    document_receive_date=?, shipment_date=?, guest_names=?, passport_visa=?, process_type=?,
    booking_code_dms=?, invoice_number=?, guest_phone=?, estimated_completion=?, tour_type=?,
    tour_code=?, tour_departure_date=?, passport_usage_date=?, passport_received_date=?, document_status=?, visa_status=?
    WHERE id = ?`).run(
    d.document_receive_date || prev.document_receive_date,
    d.shipment_date || prev.shipment_date,
    d.guest_names || prev.guest_names,
    d.passport_visa || prev.passport_visa,
    d.process_type || prev.process_type,
    d.booking_code_dms || prev.booking_code_dms,
    d.invoice_number || prev.invoice_number,
    d.guest_phone || prev.guest_phone,
    d.estimated_completion || prev.estimated_completion,
    d.tour_type || prev.tour_type,
    d.tour_code || prev.tour_code,
    d.tour_departure_date || prev.tour_departure_date,
    d.passport_usage_date || prev.passport_usage_date,
    d.passport_received_date || prev.passport_received_date,
    d.document_status || prev.document_status,
    d.visa_status || prev.visa_status,
    id
  );
  res.json(db.prepare('SELECT * FROM documents WHERE id = ?').get(id));
});

app.delete('/api/documents/:id', authenticateJWT, authorizeRoles('super','semi'), (req, res) => {
  const info = db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.json({ deleted: info.changes === 1 });
});

// --- Users management (super only for create/delete) ---
app.get('/api/users', authenticateJWT, authorizeRoles('super','semi'), (req, res) => {
  const rows = db.prepare('SELECT id, username, name, email, type, created_at FROM users ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/api/users', authenticateJWT, authorizeRoles('super'), (req, res) => {
  const { username, password, name, email, type } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });
  const hashed = bcrypt.hashSync(password, 10);
  try {
    const info = db.prepare('INSERT INTO users (username, password, name, email, type) VALUES (?,?,?,?,?)').run(username, hashed, name || '', email || '', type || 'basic');
    const user = db.prepare('SELECT id, username, name, email, type, created_at FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(user);
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'username exists' });
    throw e;
  }
});

app.put('/api/users/:username', authenticateJWT, authorizeRoles('super','semi'), (req, res) => {
  const username = req.params.username;
  const prev = db.prepare('SELECT id, username, name, email, type FROM users WHERE username = ?').get(username);
  if (!prev) return res.status(404).json({ error: 'Not found' });
  const { password, name, email, type } = req.body || {};
  if (password) {
    const hashed = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET password = ? WHERE username = ?').run(hashed, username);
  }
  db.prepare('UPDATE users SET name = ?, email = ?, type = ? WHERE username = ?').run(name || prev.name, email || prev.email, type || prev.type, username);
  res.json(db.prepare('SELECT id, username, name, email, type FROM users WHERE username = ?').get(username));
});

app.delete('/api/users/:username', authenticateJWT, authorizeRoles('super'), (req, res) => {
  const username = req.params.username;
  if (username === 'admin') return res.status(403).json({ error: 'Cannot delete default admin' });
  const info = db.prepare('DELETE FROM users WHERE username = ?').run(username);
  res.json({ deleted: info.changes === 1 });
});

// --- Regions management ---
app.get('/api/regions', authenticateJWT, (req, res) => {
  const rows = db.prepare('SELECT * FROM regions ORDER BY name').all();
  res.json(rows);
});

app.post('/api/regions', authenticateJWT, authorizeRoles('super','semi'), (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const info = db.prepare('INSERT INTO regions (name) VALUES (?)').run(name);
    res.status(201).json(db.prepare('SELECT * FROM regions WHERE id = ?').get(info.lastInsertRowid));
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'region exists' });
    throw e;
  }
});

app.delete('/api/regions/:id', authenticateJWT, authorizeRoles('super','semi'), (req, res) => {
  const info = db.prepare('DELETE FROM regions WHERE id = ?').run(req.params.id);
  res.json({ deleted: info.changes === 1 });
});

// --- Executive reporting endpoint (aggregated metrics for management) ---
app.get('/api/report/executive', authenticateJWT, authorizeRoles('super','semi'), (req, res) => {
  // Example aggregates:
  const totalTours = db.prepare('SELECT COUNT(1) as c FROM tours').get().c;
  const totalSales = db.prepare('SELECT IFNULL(SUM(sales_amount),0) as total FROM tours').get().total;
  const totalProfit = db.prepare('SELECT IFNULL(SUM(profit_amount),0) as total FROM tours').get().total;
  const pax = db.prepare('SELECT IFNULL(SUM(pax_count),0) as total FROM tours').get().total;

  // top staff by sales (limit 5)
  const topStaff = db.prepare(`
    SELECT staff_username as username, IFNULL(SUM(sales_amount),0) as sales, IFNULL(SUM(profit_amount),0) as profit, COUNT(id) as tours
    FROM tours
    GROUP BY staff_username
    ORDER BY sales DESC
    LIMIT 5
  `).all();

  // month-by-month pax for last 12 months
  const months = db.prepare(`
    SELECT substr(departure_date,1,7) as ym, IFNULL(SUM(pax_count),0) as pax
    FROM tours
    WHERE departure_date IS NOT NULL
    GROUP BY ym
    ORDER BY ym DESC
    LIMIT 12
  `).all();

  res.json({
    totalTours,
    totalSales,
    totalProfit,
    totalPax: pax,
    topStaff,
    monthlyPax: months
  });
});

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  // let static server handle assets; if not found and request accepts html, serve index
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
