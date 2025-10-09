const pool = require('../config/database');
(async () => {
  try {
    // create tables (same as earlier)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role VARCHAR(20) CHECK (role IN ('basic','semi_super','super')) DEFAULT 'basic',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // other tables...
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tour_data (
        id SERIAL PRIMARY KEY,
        reg_date DATE NOT NULL,
        lead_passenger VARCHAR(100) NOT NULL,
        all_passengers TEXT NOT NULL,
        pax_count INTEGER NOT NULL,
        tour_code VARCHAR(50) NOT NULL,
        region VARCHAR(100) NOT NULL,
        departure_date DATE NOT NULL,
        booking_code VARCHAR(50) NOT NULL,
        price BIGINT NOT NULL,
        discount_remarks TEXT,
        payment_proof TEXT,
        doc_receive_date DATE,
        visa_process_date DATE,
        visa_complete_date DATE,
        departure_status VARCHAR(20) CHECK (departure_status IN ('belum_jalan','jalan','tidak_jalan')) DEFAULT 'belum_jalan',
        doc_remarks TEXT,
        input_by VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales_data (
        id SERIAL PRIMARY KEY,
        transaction_date DATE NOT NULL,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        sales_amount BIGINT NOT NULL,
        profit_amount BIGINT NOT NULL,
        discount_amount BIGINT DEFAULT 0,
        discount_remarks TEXT,
        staff_name VARCHAR(100) NOT NULL,
        input_by VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // seed default users & regions
    const bcrypt = require('bcryptjs');
    const users = [
      { username: 'admin', password: await bcrypt.hash('admin123',10), name:'Administrator', email:'admin@company.com', role:'super' },
      { username: 'staff1', password: await bcrypt.hash('staff123',10), name:'Staff Satu', email:'staff1@company.com', role:'basic' }
    ];
    for (const u of users) {
      await pool.query('INSERT INTO users (username,password,name,email,role) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (username) DO NOTHING', [u.username, u.password, u.name, u.email, u.role]);
    }
    console.log('Migrations done'); process.exit(0);
  } catch (e) { console.error('Migration error', e); process.exit(1); }
})();
