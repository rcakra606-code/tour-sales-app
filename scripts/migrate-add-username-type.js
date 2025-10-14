// scripts/migrate-add-username-type.js
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const dbPath = path.resolve(__dirname, "../data/travel.db");
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath, { verbose: console.log });

function hasColumn(table, column) {
  try {
    const row = db.prepare(`PRAGMA table_info(${table})`).all();
    return row.some(r => r.name === column);
  } catch (err) {
    return false;
  }
}

db.transaction(() => {
  // Pastikan tabel users ada (jika belum, buat struktur minimal)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'staff'
    );
  `);

  // Tambah kolom username jika belum ada
  if (!hasColumn("users", "username")) {
    console.log("Menambahkan kolom 'username' ke tabel users...");
    db.exec(`ALTER TABLE users ADD COLUMN username TEXT;`);
    // buat index unique untuk username
    try {
      db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);`);
    } catch (e) { console.warn(e.message); }
  } else {
    console.log("Kolom 'username' sudah ada.");
  }

  // Tambah kolom type jika belum ada (frontend pakai 'type': 'super'|'semi'|'basic')
  if (!hasColumn("users", "type")) {
    console.log("Menambahkan kolom 'type' ke tabel users...");
    db.exec(`ALTER TABLE users ADD COLUMN type TEXT DEFAULT 'basic';`);
  } else {
    console.log("Kolom 'type' sudah ada.");
  }

  // Pastikan kolom role vs type consistent:
  // Kita akan keep kolom 'role' untuk kompatibilitas, tapi aplikasi frontend pakai 'type'.
  // Kita seed beberapa demo users jika belum ada.
  const check = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE username = ?").get("admin");
  if (check.cnt === 0) {
    console.log("Seeding demo users (admin, semiadmin, staff1)...");
    const insert = db.prepare(`
      INSERT INTO users (name, email, username, password, role, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const users = [
      { name: "Administrator", email: "admin@company.com", username: "admin", password: bcrypt.hashSync("admin123", 10), role: "super", type: "super" },
      { name: "Semi Super Admin", email: "semiadmin@company.com", username: "semiadmin", password: bcrypt.hashSync("semi123", 10), role: "semi", type: "semi" },
      { name: "Staff Satu", email: "staff1@company.com", username: "staff1", password: bcrypt.hashSync("staff123", 10), role: "basic", type: "basic" }
    ];

    users.forEach(u => insert.run(u.name, u.email, u.username, u.password, u.role, u.type));
    console.log("Seed selesai.");
  } else {
    console.log("Demo users sudah terdaftar (skip seeding).");
  }
})();
console.log("Migration selesai.");
