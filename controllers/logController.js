/**
 * ==========================================================
 * 📁 controllers/logController.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Controller untuk menampilkan isi file log:
 * - /logs/app.log
 * - /logs/error.log
 * - /logs/access.log
 * ==========================================================
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 📜 Ambil isi file log tertentu
 * GET /api/logs/:type  → type = app | error | access
 */
export const getLogs = async (req, res) => {
  try {
    const { type } = req.params;
    const allowed = ["app", "error", "access"];

    if (!allowed.includes(type)) {
      return res.status(400).json({ message: "Tipe log tidak valid." });
    }

    const logPath = path.join(__dirname, `../logs/${type}.log`);

    if (!fs.existsSync(logPath)) {
      return res.status(404).json({ message: "File log tidak ditemukan." });
    }

    const data = fs.readFileSync(logPath, "utf-8");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(data);
  } catch (err) {
    console.error("❌ Gagal membaca log:", err.message);
    res.status(500).json({ message: "Gagal memuat file log." });
  }
};

/**
 * 🧹 Hapus isi file log (opsional, hanya untuk role super)
 * DELETE /api/logs/:type
 */
export const clearLog = async (req, res) => {
  try {
    const { type } = req.params;
    const allowed = ["app", "error", "access"];

    if (!allowed.includes(type)) {
      return res.status(400).json({ message: "Tipe log tidak valid." });
    }

    const logPath = path.join(__dirname, `../logs/${type}.log`);

    fs.writeFileSync(logPath, "", "utf-8");
    res.json({ message: `Isi file log ${type}.log telah dibersihkan.` });
  } catch (err) {
    console.error("❌ Gagal menghapus log:", err.message);
    res.status(500).json({ message: "Gagal membersihkan log file." });
  }
};
