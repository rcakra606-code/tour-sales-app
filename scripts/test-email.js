/**
 * ==========================================================
 * 📁 scripts/test-email.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Mengirim email uji koneksi SMTP
 * (Gunakan untuk testing notifikasi atau backup alert)
 * ==========================================================
 */

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Ambil konfigurasi SMTP dari .env
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  ADMIN_EMAIL
} = process.env;

async function sendTestEmail() {
  try {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
      console.error("❌ Konfigurasi SMTP tidak lengkap di .env");
      console.log(`
Pastikan kamu punya variabel berikut di .env:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=apppassword
ADMIN_EMAIL=youremail@gmail.com
      `);
      return;
    }

    console.log("📧 Membuat koneksi SMTP...");

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false, // gunakan true jika port 465
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    console.log("✅ Terhubung ke SMTP server:", SMTP_HOST);

    const info = await transporter.sendMail({
      from: `"Travel Dashboard" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: "✅ Test Email - Travel Dashboard Enterprise",
      text: "Ini adalah email uji coba dari sistem Travel Dashboard Enterprise.",
      html: `
        <h2>✅ Test Email - Travel Dashboard Enterprise</h2>
        <p>Email ini dikirim untuk memastikan konfigurasi SMTP Anda berfungsi dengan baik.</p>
        <hr/>
        <p><strong>Waktu:</strong> ${new Date().toLocaleString()}</p>
      `
    });

    console.log("📤 Email berhasil dikirim ke:", ADMIN_EMAIL);
    console.log("📬 Message ID:", info.messageId);
  } catch (err) {
    console.error("❌ Gagal mengirim email:", err.message);
  }
}

sendTestEmail();