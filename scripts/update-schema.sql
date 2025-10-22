-- ==========================================================
-- 🧩 Travel Dashboard Enterprise v5.4.6
-- PostgreSQL Schema Update (Render + NeonDB)
-- ==========================================================

-- ==========================================================
-- 👥 USERS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  staff_name TEXT,
  role TEXT CHECK (role IN ('admin', 'semiadmin', 'staff')) DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tambahkan kolom staff_name jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='staff_name') THEN
    ALTER TABLE users ADD COLUMN staff_name TEXT;
  END IF;
END $$;

-- ==========================================================
-- 💹 SALES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  transaction_date DATE,
  invoice_number TEXT,
  staff_name TEXT,
  client_name TEXT,
  sales_amount NUMERIC DEFAULT 0,
  profit_amount NUMERIC DEFAULT 0,
  category TEXT,
  tour_code TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- ✈️ TOURS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS tours (
  id SERIAL PRIMARY KEY,
  registration_date DATE,
  lead_passenger TEXT,
  all_passengers TEXT,
  tour_code TEXT,
  region TEXT,
  departure_date DATE,
  booking_code TEXT,
  tour_price NUMERIC DEFAULT 0,
  discount_remarks TEXT,
  payment_proof TEXT,
  document_received DATE,
  visa_process_start DATE,
  visa_process_end DATE,
  document_remarks TEXT,
  staff TEXT,
  sales_amount NUMERIC DEFAULT 0,
  profit_amount NUMERIC DEFAULT 0,
  departure_status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 📑 DOCUMENTS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  received_date DATE,
  delivery_date DATE,
  guest_name TEXT,
  passport_country TEXT,
  process_type TEXT, -- Kilat / Biasa
  booking_code TEXT,
  invoice_number TEXT,
  phone_number TEXT,
  estimated_complete DATE,
  staff_name TEXT,
  tour_code TEXT,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 🌍 REGIONS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 🎯 TARGETS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS targets (
  id SERIAL PRIMARY KEY,
  staff_name TEXT NOT NULL,
  month TEXT NOT NULL, -- Format YYYY-MM
  target_sales NUMERIC DEFAULT 0,
  target_profit NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (staff_name, month)
);

-- ==========================================================
-- 🧾 AUDIT LOGS TABLE (opsional)
-- ==========================================================
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  user_name TEXT,
  action TEXT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 🔧 RELATIONSHIP INDEXES & PERFORMANCE OPTIMIZATION
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_sales_staff_date ON sales (staff_name, transaction_date);
CREATE INDEX IF NOT EXISTS idx_tours_region ON tours (region);
CREATE INDEX IF NOT EXISTS idx_documents_staff ON documents (staff_name);
CREATE INDEX IF NOT EXISTS idx_targets_month_staff ON targets (month, staff_name);

-- ==========================================================
-- ✅ SUPER ADMIN (jika belum ada)
-- ==========================================================
INSERT INTO users (username, password_hash, staff_name, role)
SELECT 'admin', '$2a$10$8yBJk0lM7DUM5Nf0l6E/yeZrHZ2P0EKc7vthbzkMSUt38a3d7XH6K', 'Super Admin', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='admin');

-- ==========================================================
-- 🏁 DONE
-- ==========================================================