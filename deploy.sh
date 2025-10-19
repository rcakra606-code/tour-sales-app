#!/bin/bash
# ==========================================================
# 🚀 deploy.sh — Travel Dashboard Enterprise v5.0
# ==========================================================
# Script otomatis untuk:
# - Build dan push repo ke GitHub
# - Trigger redeploy di Render
# - Jalankan setup.sh (init database & admin)
# ==========================================================

echo "==============================================="
echo "🚀 Travel Dashboard Enterprise — Auto Deploy"
echo "==============================================="

# Cek Git
if ! command -v git &> /dev/null
then
    echo "❌ Git tidak ditemukan. Pastikan sudah terinstal."
    exit 1
fi

# Cek Node.js
if ! command -v node &> /dev/null
then
    echo "❌ Node.js tidak ditemukan. Pastikan sudah terinstal."
    exit 1
fi

# Cek Docker (opsional)
if ! command -v docker &> /dev/null
then
    echo "⚠️  Docker tidak ditemukan. Melewati build image lokal."
else
    echo "🐳 Membuat image Docker lokal..."
    docker build -t travel-dashboard-enterprise .
    echo "✅ Build image Docker selesai."
fi

# Git push update terbaru
echo "📦 Menyiapkan commit terbaru..."
git add .
git commit -m "🚀 Auto Deploy $(date +'%Y-%m-%d %H:%M:%S')" || echo "ℹ️  Tidak ada perubahan."
git push origin main

# Trigger Render redeploy (opsional API)
if [ -n "$RENDER_DEPLOY_HOOK" ]; then
  echo "🌐 Memicu redeploy Render..."
  curl -X POST "$RENDER_DEPLOY_HOOK"
  echo "✅ Permintaan redeploy dikirim ke Render."
else
  echo "⚠️  Variabel RENDER_DEPLOY_HOOK belum diset. Lewati trigger otomatis."
fi

# Jalankan setup script
echo "🧱 Menjalankan setup.sh..."
bash setup.sh

# Buka halaman utama (opsional di macOS/Linux)
if command -v xdg-open &> /dev/null; then
  xdg-open "https://travel-dashboard.onrender.com"
elif command -v open &> /dev/null; then
  open "https://travel-dashboard.onrender.com"
else
  echo "🌍 Buka secara manual: https://travel-dashboard.onrender.com"
fi

echo "✅ Deploy selesai! Sistem siap diakses 🎯"