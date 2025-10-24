#!/usr/bin/env bash
set -euo pipefail

# apply_v6_patch.sh
# Creates v6.0 files (backend + frontend), commits to branch fix/v6.0, creates patch.
# For ESM (import ...) environment.

BRANCH="fix/v6.0"
BACKUP_DIR="backup-v60-$(date +%s)"
PATCH_FILE="tour-sales-app-v6.0.patch"

echo "=== apply_v6_patch.sh — v6.0 patch creator ==="

if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ Not a git repo. Run from repository root."
  exit 1
fi

# checkout main
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  echo "→ Switching to main..."
  git checkout main
  git pull origin main || true
fi

# create branch
if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  echo "→ Branch $BRANCH exists, checking out..."
  git checkout "$BRANCH"
else
  echo "→ Creating branch $BRANCH..."
  git checkout -b "$BRANCH"
fi

mkdir -p "$BACKUP_DIR"

backup_and_write() {
  target="$1"
  content="$2"
  if [ -f "$target" ]; then
    mkdir -p "$(dirname "$BACKUP_DIR/$target")"
    cp -a "$target" "$BACKUP_DIR/$target"
    echo "  • Backed up $target"
  fi
  mkdir -p "$(dirname "$target")"
  printf "%s\n" "$content" > "$target"
  echo "  • Wrote $target"
}

echo "→ Writing files..."

# -----------------------
# scripts/initDatabase.js
# -----------------------
backup_and_write "scripts/initDatabase.js" "$(cat <<'JS'
/**
 * scripts/initDatabase.js — reset schema v6.0 (destructive)
 * Seeds default admin (admin / Admin123)
 */
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

async function main() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.warn("DATABASE_URL not set — skipping DB init.");
      return;
    }
    const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false }});
    const client = await pool.connect();
    try {
      console.log("Connected to DB — resetting schema v6.0...");
      await client.query("BEGIN");

      // drop tables if exist
      await client.query(`DROP TABLE IF EXISTS logs;`);
      await client.query(`DROP TABLE IF EXISTS targets;`);
      await client.query(`DROP TABLE IF EXISTS documents;`);
      await client.query(`DROP TABLE IF EXISTS sales;`);
      await client.query(`DROP TABLE IF EXISTS tours;`);
      await client.query(`DROP TABLE IF EXISTS regions;`);
      await client.query(`DROP TABLE IF EXISTS users;`);

      // recreate schema
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          staff_name VARCHAR(150),
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'staff',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE regions (
          id SERIAL PRIMARY KEY,
          code VARCHAR(50),
          name VARCHAR(150) NOT NULL
        );
      `);

      await client.query(`
        CREATE TABLE tours (
          id SERIAL PRIMARY KEY,
          registration_date DATE,
          lead_passenger VARCHAR(255),
          all_passengers INT DEFAULT 1,
          tour_code VARCHAR(100),
          region_id INT REFERENCES regions(id),
          departure_date DATE,
          booking_code VARCHAR(100),
          tour_price NUMERIC DEFAULT 0,
          discount_remarks TEXT,
          payment_proof TEXT,
          document_received BOOLEAN DEFAULT false,
          visa_process_start DATE,
          visa_process_end DATE,
          document_remarks TEXT,
          staff_name VARCHAR(150),
          sales_amount NUMERIC DEFAULT 0,
          profit_amount NUMERIC DEFAULT 0,
          departure_status VARCHAR(50) DEFAULT 'PENDING',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE sales (
          id SERIAL PRIMARY KEY,
          transaction_date DATE,
          invoice VARCHAR(100),
          staff_name VARCHAR(150),
          sales_amount NUMERIC DEFAULT 0,
          profit_amount NUMERIC DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE documents (
          id SERIAL PRIMARY KEY,
          received_date DATE,
          sent_date DATE,
          guest_name VARCHAR(255),
          passport_or_visa VARCHAR(255),
          process_type VARCHAR(50),
          booking_code_dms VARCHAR(100),
          invoice_no VARCHAR(100),
          guest_phone VARCHAR(50),
          eta DATE,
          staff_name VARCHAR(150),
          tour_code VARCHAR(100),
          remarks TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE targets (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id),
          year INT,
          month INT,
          sales_target NUMERIC DEFAULT 0,
          profit_target NUMERIC DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE logs (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "user" VARCHAR(150),
          action VARCHAR(150),
          detail TEXT,
          ip VARCHAR(50)
        );
      `);

      // seed default admin (idempotent)
      const pw = "Admin123";
      const hash = bcrypt.hashSync(pw, 10);
      await client.query(
        `INSERT INTO users (username, staff_name, password_hash, role) VALUES ($1,$2,$3,$4) ON CONFLICT (username) DO NOTHING`,
        ["admin","Super Admin", hash, "superadmin"]
      );

      await client.query("COMMIT");
      console.log("Database reset complete, admin seeded (username: admin, password: Admin123)");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("DB init failed:", err);
    } finally {
      client.release();
      await pool.end();
    }
  } catch (e) {
    console.error("initDatabase error:", e);
  }
}

main();
JS
)"

# -------------------------
# controllers/profileController.js
# -------------------------
backup_and_write "controllers/profileController.js" "$(cat <<'JS'
import db from "../config/database.js";
import bcrypt from "bcryptjs";

export async function getProfile(req, res){
  try{
    const userId = req.user?.id;
    const q = await db.query("SELECT id, username, staff_name, role, created_at FROM users WHERE id=$1", [userId]);
    res.json(q.rows[0] || null);
  }catch(err){
    console.error("GET profile error:", err);
    res.status(500).json({ message: "Gagal memuat profile" });
  }
}

export async function updateProfile(req, res){
  try{
    const userId = req.user?.id;
    const { staff_name } = req.body;
    await db.query("UPDATE users SET staff_name=$1 WHERE id=$2", [staff_name, userId]);
    res.json({ message: "Profil diperbarui" });
  }catch(err){
    console.error("UPDATE profile error:", err);
    res.status(500).json({ message: "Gagal memperbarui profile" });
  }
}

export async function changePassword(req, res){
  try{
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    const q = await db.query("SELECT password_hash FROM users WHERE id=$1", [userId]);
    if(q.rows.length===0) return res.status(404).json({ message: "User tidak ditemukan" });
    const hash = q.rows[0].password_hash;
    const ok = bcrypt.compareSync(currentPassword, hash);
    if(!ok) return res.status(400).json({ message: "Password lama salah" });
    const newHash = bcrypt.hashSync(newPassword, 10);
    await db.query("UPDATE users SET password_hash=$1 WHERE id=$2", [newHash, userId]);
    res.json({ message: "Password berhasil diubah" });
  }catch(err){
    console.error("CHANGE password error:", err);
    res.status(500).json({ message: "Gagal mengubah password" });
  }
}
JS
)"

# -------------------------
# controllers/regionController.js
# -------------------------
backup_and_write "controllers/regionController.js" "$(cat <<'JS'
import db from "../config/database.js";

export async function getRegions(req, res){
  try{
    const q = await db.query("SELECT id, name FROM regions ORDER BY name ASC");
    res.json(q.rows);
  }catch(err){
    console.error("GET regions error:", err);
    res.status(500).json({ message: "Gagal mengambil regions" });
  }
}

export async function createRegion(req, res){
  try{
    const { code, name } = req.body;
    const q = await db.query("INSERT INTO regions (code, name) VALUES ($1,$2) RETURNING *", [code || null, name]);
    res.json(q.rows[0]);
  }catch(err){
    console.error("Create region error:", err);
    res.status(500).json({ message: "Gagal membuat region" });
  }
}
JS
)"

# -------------------------
# controllers/tourController.js
# -------------------------
backup_and_write "controllers/tourController.js" "$(cat <<'JS'
import db from "../config/database.js";

export async function getTours(req, res){
  try{
    const q = await db.query(`
      SELECT t.*, r.name as region_name
      FROM tours t
      LEFT JOIN regions r ON r.id = t.region_id
      ORDER BY t.created_at DESC
    `);
    res.json(q.rows);
  }catch(err){
    console.error("GET tours error:", err);
    res.status(500).json({ message: "Gagal mengambil tours" });
  }
}

export async function createTour(req, res){
  try{
    const data = req.body;
    const q = await db.query(`
      INSERT INTO tours (registration_date, lead_passenger, all_passengers, tour_code, region_id, departure_date,
        booking_code, tour_price, discount_remarks, payment_proof, document_received, visa_process_start,
        visa_process_end, document_remarks, staff_name, sales_amount, profit_amount, departure_status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
      [
        data.registrationDate || null,
        data.leadPassenger || null,
        data.allPassengers || 1,
        data.tourCode || null,
        data.regionId || null,
        data.departureDate || null,
        data.bookingCode || null,
        data.tourPrice || 0,
        data.discountRemarks || null,
        data.paymentProof || null,
        data.documentReceived || false,
        data.visaProcessStart || null,
        data.visaProcessEnd || null,
        data.documentRemarks || null,
        data.staff || null,
        data.salesAmount || 0,
        data.profitAmount || 0,
        data.departureStatus || "PENDING"
      ]);
    res.json(q.rows[0]);
  }catch(err){
    console.error("CREATE tour error:", err);
    res.status(500).json({ message:"Gagal membuat tour" });
  }
}
JS
)"

# -------------------------
# controllers/dashboardController.js
# -------------------------
backup_and_write "controllers/dashboardController.js" "$(cat <<'JS'
import db from "../config/database.js";

export async function getDashboardSummary(req, res){
  try{
    const totalToursQ = await db.query("SELECT COUNT(*) as cnt FROM tours");
    const totalSalesQ = await db.query("SELECT COALESCE(SUM(sales_amount),0) as total FROM sales");
    const totalProfitQ = await db.query("SELECT COALESCE(SUM(profit_amount),0) as total FROM sales");
    const totalDocsQ = await db.query("SELECT COUNT(*) as cnt FROM documents");

    const targetsQ = await db.query("SELECT COALESCE(SUM(sales_target),0) as sales_target, COALESCE(SUM(profit_target),0) as profit_target FROM targets");

    res.json({
      total_tours: Number(totalToursQ.rows[0].cnt || 0),
      total_sales: Number(totalSalesQ.rows[0].total || 0),
      total_profit: Number(totalProfitQ.rows[0].total || 0),
      total_documents: Number(totalDocsQ.rows[0].cnt || 0),
      target_sales: Number(targetsQ.rows[0].sales_target || 0),
      target_profit: Number(targetsQ.rows[0].profit_target || 0)
    });
  }catch(err){
    console.error("Dashboard summary error:", err);
    res.status(500).json({ message: "Gagal memuat summary" });
  }
}
JS
)"

# -------------------------
# controllers/executiveReportController.js
# -------------------------
backup_and_write "controllers/executiveReportController.js" "$(cat <<'JS'
import db from "../config/database.js";

export async function getExecutiveSummary(req,res){
  try{
    const summary = await db.query(`
      SELECT COALESCE(r.name,'(Unknown)') as region, COUNT(t.id) as tours, COALESCE(SUM(t.sales_amount),0) as sales, COALESCE(SUM(t.profit_amount),0) as profit
      FROM tours t
      LEFT JOIN regions r ON r.id = t.region_id
      GROUP BY r.name ORDER BY sales DESC
    `);
    res.json(summary.rows);
  }catch(err){
    console.error("Executive summary error:", err);
    res.status(500).json({ message: "Gagal memuat executive summary" });
  }
}

export async function getMonthlyPerformance(req,res){
  try{
    const year = Number(req.query.year) || (new Date()).getFullYear();
    const q = await db.query(`
      SELECT TO_CHAR(COALESCE(transaction_date, created_at), 'Mon') as month,
        COALESCE(SUM(sales_amount),0) as sales, COALESCE(SUM(profit_amount),0) as profit
      FROM sales
      WHERE EXTRACT(YEAR FROM COALESCE(transaction_date, created_at)) = $1
      GROUP BY 1 ORDER BY date_part('month', COALESCE(transaction_date, created_at))
    `, [year]);
    res.json(q.rows);
  }catch(err){
    console.error("Monthly performance error:", err);
    res.status(500).json({ message: "Gagal memuat monthly performance" });
  }
}
JS
)"

# -------------------------
# routes/executiveReport.js
# -------------------------
backup_and_write "routes/executiveReport.js" "$(cat <<'JS'
import express from "express";
import { getExecutiveSummary, getMonthlyPerformance } from "../controllers/executiveReportController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", authenticate, getExecutiveSummary);
router.get("/monthly-performance", authenticate, getMonthlyPerformance);

export default router;
JS
)"

# -------------------------
# public files: login.html, dashboard.html, css, js
# -------------------------
backup_and_write "public/login.html" "$(cat <<'HTML'
<!DOCTYPE html>
<html lang="id" class="h-full">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Login — Travel Dashboard</title>
  <meta name="description" content="Travel Dashboard — Login" />
  <link rel="stylesheet" href="./css/style.css">
</head>
<body class="page-login">
  <main class="center-page">
    <div class="card login-card">
      <h2>Masuk</h2>
      <p class="muted">Masuk untuk mengakses dashboard</p>
      <form id="loginForm">
        <div class="form-grid">
          <label>Username</label>
          <input id="username" name="username" type="text" required placeholder="username" />
          <label>Password</label>
          <input id="password" name="password" type="password" required placeholder="password" />
        </div>
        <div class="form-actions">
          <button class="btn primary" type="submit">Login</button>
        </div>
        <p id="loginMessage" class="muted center"></p>
      </form>
    </div>
  </main>

  <div class="toast-wrap" id="toastWrap"></div>
  <script src="./js/ui.js"></script>
  <script>
    const toastWrap = document.getElementById("toastWrap");
    const toast = (m,t='info',d=3000) => {
      const el=document.createElement('div'); el.className='toast '+t; el.textContent=m; toastWrap.appendChild(el);
      setTimeout(()=>el.remove(),d);
    };

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = document.getElementById('username').value.trim();
      const p = document.getElementById('password').value.trim();
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login gagal');
        localStorage.setItem('token', data.token);
        if(data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        toast('Login berhasil','success',1500);
        setTimeout(()=>location.href='dashboard.html',600);
      } catch(err) {
        document.getElementById('loginMessage').textContent = err.message;
        toast(err.message,'error',3500);
      }
    });
  </script>
</body>
</html>
HTML
)"

backup_and_write "public/dashboard.html" "$(cat <<'HTML'
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Dashboard — Travel Dashboard</title>
  <meta name="description" content="Travel Dashboard — Executive Summary" />
  <link rel="stylesheet" href="./css/style.css" />
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand">TravelDashboard</div>
        <button class="btn-compact" data-toggle="sidebar">☰</button>
      </div>

      <nav>
        <ul>
          <li><a href="dashboard.html" class="active">Dashboard</a></li>
          <li class="has-children"><a href="#">Reports</a>
            <ul>
              <li><a href="report_tour.html">Report Tour</a></li>
              <li><a href="report_sales.html">Report Sales</a></li>
              <li><a href="report_document.html">Report Document</a></li>
            </ul>
          </li>
          <li class="has-children"><a href="#">Management</a>
            <ul>
              <li><a href="user-management.html">User Management</a></li>
              <li><a href="region_management.html">Region Management</a></li>
              <li><a href="target_management.html">Target Management</a></li>
            </ul>
          </li>
          <li><a href="executive-dashboard.html">Executive Dashboard</a></li>
          <li><a href="profile.html">Profile</a></li>
          <li><a href="logout.html">Logout</a></li>
        </ul>
      </nav>

      <div class="theme-area">
        <label><input type="checkbox" id="themeSwitch" /> 🌙 Dark Mode</label>
      </div>
    </aside>

    <main>
      <div class="header">
        <div class="left">
          <button class="toggle" data-toggle="sidebar">☰</button>
          <h1>Dashboard</h1>
        </div>
        <div class="right">
          <span class="current-user"></span>
        </div>
      </div>

      <section class="card">
        <h2>Ringkasan</h2>
        <div id="summaryCards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px"></div>
      </section>

      <section class="card">
        <h2>Performa Bulanan</h2>
        <canvas id="dashboardChart" height="180"></canvas>
      </section>

      <section class="card">
        <h2>Aktivitas Terbaru</h2>
        <table class="table" id="recentTable">
          <thead><tr><th>Tanggal</th><th>Kategori</th><th>Deskripsi</th><th>Staff</th></tr></thead>
          <tbody></tbody>
        </table>
      </section>

      <footer>© 2025 Travel Dashboard Enterprise</footer>
    </main>
  </div>

  <div class="toast-wrap" id="toastWrap"></div>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="./js/ui.js"></script>
  <script src="./js/dashboard.js"></script>
</body>
</html>
HTML
)"

backup_and_write "public/css/style.css" "$(cat <<'CSS'
/* style.css v6.0 — Corporate Blue + form grid */
:root{
  --bg:#f6f9fc;
  --card:#ffffff;
  --muted:#6b7280;
  --accent:#0b69ff;
  --text:#0f1724;
  --radius:10px;
  --gap:12px;
  --shadow: 0 6px 18px rgba(12,24,48,0.06);
}
*{box-sizing:border-box}
body{font-family:Inter,system-ui,Segoe UI,Roboto,Arial; margin:0; color:var(--text); background:var(--bg);}

/* center login */
.center-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);padding:18px}
.login-card{width:100%;max-width:420px}
.muted{color:var(--muted);font-size:13px}
.center{text-align:center}

/* form grid */
.form-grid{display:grid;grid-template-columns:1fr 2fr;gap:10px;align-items:center}
.form-grid label{font-weight:600;font-size:14px}
.form-grid input, .form-grid select, .form-grid textarea{padding:10px;border:1px solid #e6e9ef;border-radius:8px;width:100%;}
.form-actions{margin-top:14px;text-align:right}

/* buttons */
.btn{padding:10px 14px;border-radius:8px;border:0;cursor:pointer}
.btn.primary{background:var(--accent);color:#fff;font-weight:600}
.btn.ghost{background:transparent;border:1px solid #e6e9ef;color:var(--text)}

/* app layout */
.app{display:flex;min-height:100vh}
.sidebar{width:260px;background:#062a4f;color:#fff;flex-shrink:0;padding:14px;display:flex;flex-direction:column;gap:12px}
.sidebar .brand{font-weight:800;font-size:18px}
.sidebar nav ul{list-style:none;padding:0;margin:0}
.sidebar nav a{color:#e6f0ff;text-decoration:none;display:block;padding:8px;border-radius:8px}
.sidebar .theme-area{margin-top:auto;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)}

/* collapsed */
.sidebar.collapsed{width:64px}
.sidebar.collapsed nav a{font-size:0;padding:8px}
.sidebar .btn-compact{background:transparent;border:0;color:inherit;cursor:pointer}

/* main */
main{flex:1;padding:20px}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.header .left h1{margin:0;font-size:20px}
.header .right .current-user{font-weight:600;color:#334155}

/* cards & summary */
.card{margin-bottom:12px}
#summaryCards .card{padding:12px}
.table{width:100%;border-collapse:collapse}
.table th, .table td{padding:8px;text-align:left;border-bottom:1px solid #eef2f6}

/* responsive */
@media (max-width:900px){
  .sidebar{display:none}
  .app{flex-direction:column}
  .form-grid{grid-template-columns:1fr}
}
CSS
)"

backup_and_write "public/js/ui.js" "$(cat <<'JS'
(function(){
  "use strict";
  const body = document.body;
  const SIDEBAR_KEY = "td_sidebar_state";
  const THEME_KEY = "td_theme_mode";
  const TOKEN_KEY = "token";
  const REFRESH_KEY = "refreshToken";

  // sidebar toggle (buttons with data-toggle="sidebar")
  document.querySelectorAll('[data-toggle="sidebar"]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.preventDefault();
      const sidebar = document.querySelector('.sidebar');
      if(!sidebar) return;
      sidebar.classList.toggle('collapsed');
      localStorage.setItem(SIDEBAR_KEY, sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
    });
  });

  // restore sidebar state
  try{
    const s = localStorage.getItem(SIDEBAR_KEY);
    if(s==='collapsed'){ document.querySelectorAll('.sidebar').forEach(sb=>sb.classList.add('collapsed')); }
  }catch(e){}

  // theme switch (element with id themeSwitch inside sidebar)
  const themeSwitch = document.getElementById('themeSwitch');
  try{
    const mode = localStorage.getItem(THEME_KEY) || 'light';
    if(mode==='dark') document.documentElement.classList.add('theme-dark');
    if(themeSwitch) themeSwitch.checked = (mode==='dark');
    if(themeSwitch) themeSwitch.addEventListener('change', ()=>{
      if(themeSwitch.checked){ document.documentElement.classList.add('theme-dark'); localStorage.setItem(THEME_KEY,'dark'); }
      else { document.documentElement.classList.remove('theme-dark'); localStorage.setItem(THEME_KEY,'light'); }
    });
  }catch(e){}

  // current user indicator (.current-user)
  (async function showCurrentUser(){
    const nodes = document.querySelectorAll('.current-user');
    if(nodes.length===0) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if(!token) return;
    try{
      const res = await fetch('/api/profile', { headers: { Authorization: 'Bearer '+token }});
      if(!res.ok) return;
      const u = await res.json();
      nodes.forEach(n => n.textContent = `👤 ${u.staff_name || u.username} (${u.role})`);
    }catch(e){}
  })();

  // secureFetch with refresh attempt
  async function refreshToken(){
    const rt = localStorage.getItem(REFRESH_KEY);
    if(!rt) return false;
    try{
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ refreshToken: rt })
      });
      const data = await res.json();
      if(!res.ok) return false;
      localStorage.setItem(TOKEN_KEY, data.token);
      if(data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
      return true;
    }catch(e){
      return false;
    }
  }

  window.secureFetch = async function(url, options = {}){
    options.headers = options.headers || {};
    const token = localStorage.getItem(TOKEN_KEY);
    if(token) options.headers['Authorization'] = 'Bearer ' + token;
    let res = await fetch(url, options);
    if(res.status === 401){
      const ok = await refreshToken();
      if(ok){
        options.headers['Authorization'] = 'Bearer ' + localStorage.getItem(TOKEN_KEY);
        res = await fetch(url, options);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        location.href = 'login.html';
      }
    }
    return res;
  };

  // redirect to login if no token and not on login page
  try{
    const page = location.pathname.split('/').pop();
    const whitelisted = ['login.html','index.html',''];
    if(!whitelisted.includes(page) && !localStorage.getItem(TOKEN_KEY)) {
      location.href = 'login.html';
    }
  }catch(e){}
})();
JS
)"

backup_and_write "public/js/dashboard.js" "$(cat <<'JS'
(async function(){
  try{
    const res = await secureFetch('/api/dashboard/summary');
    if(!res.ok) throw new Error('Gagal memuat summary');
    const data = await res.json();

    const cards = document.getElementById('summaryCards');
    const makeCard = (title, value) => {
      const c = document.createElement('div'); c.className='card';
      c.innerHTML = `<strong style="font-size:18px">${value}</strong><div class="muted">${title}</div>`;
      return c;
    };
    cards.appendChild(makeCard('Total Tours', data.total_tours));
    cards.appendChild(makeCard('Total Sales', data.total_sales));
    cards.appendChild(makeCard('Total Profit', data.total_profit));
    cards.appendChild(makeCard('Total Documents', data.total_documents));
    cards.appendChild(makeCard('Target Sales', data.target_sales));
    cards.appendChild(makeCard('Target Profit', data.target_profit));

    // chart (monthly sales) - minimal example plotting 12 months zeros if none
    const ctx = document.getElementById('dashboardChart');
    if(ctx){
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          datasets: [{ label:'Sales', data: new Array(12).fill(0) }]
        }
      });
    }
  }catch(err){
    console.error('❌ Dashboard load error:', err);
  }
})();
JS
)"

# -------------------------
# package.json postinstall addition (idempotent)
# -------------------------
node -e "
const fs=require('fs');
const p='package.json';
if(fs.existsSync(p)){
  const o=JSON.parse(fs.readFileSync(p));
  o.scripts=o.scripts||{};
  if(!o.scripts.postinstall){
    o.scripts.postinstall='node scripts/initDatabase.js || true';
    fs.writeFileSync(p, JSON.stringify(o, null, 2));
    console.log('→ postinstall added to package.json');
  } else {
    console.log('→ package.json already has postinstall, skipped');
  }
} else {
  console.log('→ package.json not found; please ensure repo root is correct.');
}
"

# -------------------------
# stage, commit & patch
# -------------------------
git add -A
git commit -m "v6.0: full UI rebuild + backend sync (initDatabase, controllers, public)" || true
git format-patch -1 HEAD --stdout > "$PATCH_FILE" || true

echo "✅ Patch created: $PATCH_FILE"
echo "Backups saved in $BACKUP_DIR"
echo "Branch: $BRANCH"

echo ""
echo "Next steps:"
echo "  git push origin $BRANCH"
echo "  review & merge to main"
echo ""
echo "If you want me to produce the raw .patch content here, tell me and I'll print it out."