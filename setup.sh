#!/bin/bash
# ==========================================================
# 🚀 setup.sh — Travel Dashboard Enterprise v5.0
# ==========================================================
# Script otomatis setup seluruh sistem di Render atau lokal:
# - Inisialisasi database NeonDB
# - Membuat akun super admin
# - Menjalankan backup pertama
# - (Opsional) Test email notifikasi
# ==========================================================

echo "==============================================="
echo "🚀 Travel Dashboard Enterprise — Setup Script"
echo "==============================================="

# Pastikan Node.js tersedia
if ! command -v node &> /dev/null
then
    echo "❌ Node.js tidak ditemukan. Pastikan sudah terinstal."
    exit 1
fi

# Cek environment
if [ ! -f ".env" ]; then
  echo "⚠️  File .env tidak ditemukan, membuat template .env..."
  cat <<EOT >> .env
NODE_ENV=production
PORT=5000
DATABASE_URL=
JWT_SECRET=changeme
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://travel-dashboard.onrender.com
EOT
  echo "✅ Template .env dibuat. Lengkapi variabel DATABASE_URL sebelum lanjut."
  exit 0
fi

echo "📦 Memeriksa koneksi database..."
node scripts/check-db.js

echo "🧱 Menginisialisasi tabel database..."
node scripts/initDatabase.js

echo "👤 Membuat akun Super Admin (jika belum ada)..."
node scripts/setup-admin.js

echo "💾 Membuat backup pertama..."
node scripts/backup-database.js

# Optional test email
read -p "📧 Ingin melakukan test email notifikasi? (y/n): " testEmail
if [ "$testEmail" = "y" ] || [ "$testEmail" = "Y" ]; then
  node scripts/test-email.js
else
  echo "📨 Test email dilewati."
fi

echo "✅ Setup selesai! Sistem siap dijalankan."
echo "-----------------------------------------------"
echo "🌐 Jalankan aplikasi dengan:"
echo "   npm start"
echo ""
echo "🔑 Login dengan akun admin default:"
echo "   Username: admin"
echo "   Password: Admin123!"
echo "-----------------------------------------------"