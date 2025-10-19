#!/bin/bash
# ==========================================================
# 🚀 scripts/auto-repair-deploy.sh
# Travel Dashboard Enterprise v3.9.8
# ==========================================================
# Fungsi:
# 1️⃣ Memastikan folder routes/, controllers/, middleware/ ada di build Render.
# 2️⃣ Jika hilang → auto-fetch ulang dari Git main branch.
# 3️⃣ Memperbaiki missing files, log error, dan trigger redeploy otomatis.
# ==========================================================

echo "🔧 [AutoRepair] Memulai pengecekan struktur project..."

# Direktori penting
REQUIRED_DIRS=("routes" "controllers" "middleware" "config" "public")

# Cek setiap direktori
MISSING=()
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "⚠️  Folder hilang: $dir"
    MISSING+=("$dir")
  else
    echo "✅ Folder ditemukan: $dir"
  fi
done

# Jika ada folder yang hilang, lakukan perbaikan otomatis
if [ ${#MISSING[@]} -ne 0 ]; then
  echo "🚨 [AutoRepair] Ditemukan folder penting yang hilang. Melakukan sinkronisasi ulang..."
  
  # Coba ambil ulang dari Git remote (Render container punya .git)
  if [ -d .git ]; then
    echo "🔄 Fetching ulang dari remote repository..."
    git fetch origin main --quiet
    git restore --source=origin/main --staged --worktree "${MISSING[@]}" || true
    echo "✅ Folder berhasil dipulihkan dari remote branch main."
  else
    echo "❌ Tidak ada repo Git di container Render — tidak bisa auto-restore."
    echo "💡 Solusi manual: pastikan folder ${MISSING[*]} di-commit ke repo kamu."
    exit 1
  fi
fi

# Verifikasi ulang setelah restore
echo "🔍 [AutoRepair] Verifikasi ulang struktur folder..."
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ OK: $dir"
  else
    echo "❌ MASIH HILANG: $dir"
    echo "🚫 AutoDeploy dibatalkan."
    exit 1
  fi
done

# Jika semua aman → lanjut deploy startup
echo "🚀 [AutoRepair] Semua struktur valid. Melanjutkan startup server..."
exec npm start
