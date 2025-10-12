const db = require("../config/database");

const User = {
  /**
   * 🔍 Cari user berdasarkan username
   */
  findByUsername(username) {
    try {
      const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
      const user = stmt.get(username);
      return user || null;
    } catch (err) {
      console.error("❌ DB error (findByUsername):", err.message);
      return null;
    }
  },

  /**
   * ➕ Tambah user baru
   */
  create(username, password, role = "staff") {
    try {
      const stmt = db.prepare(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)"
      );
      const result = stmt.run(username, password, role);
      return { id: result.lastInsertRowid };
    } catch (err) {
      console.error("❌ DB error (create user):", err.message);
      return null;
    }
  },

  /**
   * 📜 Ambil semua user (khusus admin)
   */
  getAll() {
    try {
      return db.prepare("SELECT id, username, role FROM users").all();
    } catch (err) {
      console.error("❌ DB error (getAll users):", err.message);
      return [];
    }
  },

  /**
   * 🗑️ Hapus user (optional untuk admin)
   */
  delete(id) {
    try {
      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      return true;
    } catch (err) {
      console.error("❌ DB error (delete user):", err.message);
      return false;
    }
  },
};

module.exports = User;
