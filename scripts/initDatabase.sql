-- ==========================================================
-- 🧩 Travel Dashboard Enterprise v5.1
-- Database Schema (Neon PostgreSQL)
-- ==========================================================

-- =========================
-- TABLE: users
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  staff_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin user (only if table empty)
INSERT INTO users (username, password, staff_name, role)
SELECT 'admin', '$2b$10$5jKx1v1O/ssWbOQK6Hr86OayW7sMZFBGdGzK7VkC92rkKypEj/jrS', 'Administrator', 'super'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- =========================
-- TABLE: regions
-- =========================
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE: tours
-- =========================
CREATE TABLE IF NOT EXISTS tours (
  id SERIAL PRIMARY KEY,
  registration_date DATE,
  lead_passenger VARCHAR(100),
  all_passengers TEXT,
  tour_code VARCHAR(50),
  region VARCHAR(100),
  departure_date DATE,
  booking_code VARCHAR(50),
  tour_price NUMERIC DEFAULT 0,
  discount_remarks TEXT,
  payment_proof TEXT,
  document_received DATE,
  visa_process_start DATE,
  visa_process_end DATE,
  document_remarks TEXT,
  staff VARCHAR(100),
  sales_amount NUMERIC DEFAULT 0,
  profit_amount NUMERIC DEFAULT 0,
  departure_status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE: sales
-- =========================
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  transaction_date DATE NOT NULL,
  invoice_number VARCHAR(50) NOT NULL,
  staff_name VARCHAR(100) NOT NULL,
  sales_amount NUMERIC DEFAULT 0,
  profit_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE: targets
-- =========================
CREATE TABLE IF NOT EXISTS targets (
  id SERIAL PRIMARY KEY,
  staff_name VARCHAR(100) NOT NULL,
  target_month DATE NOT NULL,
  target_sales NUMERIC DEFAULT 0,
  target_profit NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE: documents
-- =========================
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  receive_date DATE NOT NULL,
  send_date DATE,
  guest_name VARCHAR(100),
  passport_visa VARCHAR(100),
  process_type VARCHAR(20),
  booking_code_dms VARCHAR(50),
  invoice_number VARCHAR(50),
  guest_phone VARCHAR(50),
  estimate_finish DATE,
  staff_name VARCHAR(100),
  tour_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE: logs
-- =========================
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100),
  action VARCHAR(50),
  description TEXT,
  ip VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);