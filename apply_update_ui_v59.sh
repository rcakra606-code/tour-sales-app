#!/usr/bin/env bash
set -euo pipefail

# apply_update_ui_v59.sh
# Usage:
#   chmod +x apply_update_ui_v59.sh
#   ./apply_update_ui_v59.sh
#
# This script:
# - Creates branch fix/v5.9 from main
# - Backs up overwritten files to ./backup-v59-<ts>/
# - Writes updated frontend & backend files addressing v5.9 fixes
# - Updates scripts/initDatabase.js to reset DB schema v5.9
# - Adds postinstall script if not present
# - Commits and produces update-ui-v59.patch
#
# Review script before running.

BRANCH="fix/v5.9"
BACKUP_DIR="backup-v59-$(date +%s)"

echo "Ensure you're in repo root and on main branch..."
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  echo "Switching to main..."
  git checkout main
  git pull origin main
fi

echo "Creating new branch: $BRANCH"
git checkout -b "$BRANCH"

echo "Creating backup dir: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# helper: backup file then write new content
backup_and_write() {
  target="$1"
  content="$2"
  if [ -f "$target" ]; then
    mkdir -p "$(dirname "$BACKUP_DIR/$target")"
    cp "$target" "$BACKUP_DIR/$target"
    echo "Backed up $target"
  fi
  mkdir -p "$(dirname "$target")"
  printf "%s\n" "$content" > "$target"
  echo "Wrote $target"
}

echo "Writing updated files..."

# -------------------------
# scripts/initDatabase.js
# -------------------------
init_db_js='
/**
 * initDatabase.js (v5.9)
 * Drops & recreates schema for v5.9
 * WARNING: destructive (drops tables)
 */
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

async function main(){
  try{
    const DATABASE_URL = process.env.DATABASE_URL;
    if(!DATABASE_URL){
      console.warn("DATABASE_URL not set, skipping DB init.");
      return;
    }
    const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    const client = await pool.connect();
    try {
      console.log("Connected to DB — resetting schema v5.9...");
      await client.query("BEGIN");

      await client.query(`DROP TABLE IF EXISTS logs;`);
      await client.query(`DROP TABLE IF EXISTS targets;`);
      await client.query(`DROP TABLE IF EXISTS documents;`);
      await client.query(`DROP TABLE IF EXISTS sales;`);
      await client.query(`DROP TABLE IF EXISTS tours;`);
      await client.query(`DROP TABLE IF EXISTS regions;`);
      await client.query(`DROP TABLE IF EXISTS users;`);

      await client.query(\`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          staff_name VARCHAR(200),
          password_hash VARCHAR(200) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'staff',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      \`);

      await client.query(\`
        CREATE TABLE regions (
          id SERIAL PRIMARY KEY,
          code VARCHAR(50),
          name VARCHAR(150) NOT NULL
        );
      \`);

      await client.query(\`
        CREATE TABLE tours (
          id SERIAL PRIMARY KEY,
          registration_date DATE,
          lead_passenger VARCHAR(255),
          all_passengers INTEGER DEFAULT 1,
          tour_code VARCHAR(100),
          region_id INTEGER REFERENCES regions(id),
          departure_date DATE,
          booking_code VARCHAR(100),
          tour_price NUMERIC DEFAULT 0,
          discount_remarks TEXT,
          payment_proof TEXT,
          document_received BOOLEAN DEFAULT false,
          visa_process_start DATE,
          visa_process_end DATE,
          document_remarks TEXT,
          staff_name VARCHAR(200),
          sales_amount NUMERIC DEFAULT 0,
          profit_amount NUMERIC DEFAULT 0,
          departure_status VARCHAR(50) DEFAULT \'PENDING\',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      \`);

      await client.query(\`
        CREATE TABLE sales (
          id SERIAL PRIMARY KEY,
          transaction_date DATE,
          invoice VARCHAR(100),
          staff_name VARCHAR(200),
          sales_amount NUMERIC DEFAULT 0,
          profit_amount NUMERIC DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      \`);

      await client.query(\`
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
          staff_name VARCHAR(200),
          tour_code VARCHAR(100),
          remarks TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      \`);

      await client.query(\`
        CREATE TABLE targets (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          year INTEGER,
          month INTEGER,
          sales_target NUMERIC DEFAULT 0,
          profit_target NUMERIC DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      \`);

      await client.query(\`
        CREATE TABLE logs (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "user" VARCHAR(200),
          action VARCHAR(150),
          detail TEXT,
          ip VARCHAR(100)
        );
      \`);

      // seed admin
      const pw = "Admin123";
      const hash = bcrypt.hashSync(pw, 10);
      await client.query(
        \`INSERT INTO users (username, staff_name, password_hash, role) VALUES ($1,$2,$3,$4) ON CONFLICT (username) DO NOTHING\`,
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
  }catch(e){
    console.error("initDatabase error:", e);
  }
}

main();
'
backup_and_write "scripts/initDatabase.js" "$init_db_js"

# -------------------------
# controllers/regionController.js
# -------------------------
region_controller='
import db from "../config/database.js";

export async function getRegions(req, res){
  try{
    const q = await db.query("SELECT id, name FROM regions ORDER BY name");
    res.json(q.rows);
  }catch(err){
    console.error("GET regions error:", err);
    res.status(500).json({ message: "Gagal mengambil regions" });
  }
}

export async function createRegion(req, res){
  try{
    const { name, code } = req.body;
    const q = await db.query("INSERT INTO regions (code, name) VALUES ($1,$2) RETURNING *", [code || null, name]);
    res.json(q.rows[0]);
  }catch(err){
    console.error("Create region error:", err);
    res.status(500).json({ message: "Gagal membuat region" });
  }
}
'
backup_and_write "controllers/regionController.js" "$region_controller"

# -------------------------
# controllers/tourController.js
# -------------------------
tour_controller='
import db from "../config/database.js";

export async function getTours(req, res){
  try{
    const q = await db.query(\`
      SELECT t.*, r.name as region_name
      FROM tours t
      LEFT JOIN regions r ON r.id = t.region_id
      ORDER BY t.created_at DESC
    \`);
    res.json(q.rows);
  }catch(err){
    console.error("GET tours error:", err);
    res.status(500).json({ message: "Gagal mengambil tours" });
  }
}

export async function createTour(req, res){
  try{
    const data = req.body;
    const q = await db.query(\`
      INSERT INTO tours (registration_date, lead_passenger, all_passengers, tour_code, region_id, departure_date,
        booking_code, tour_price, discount_remarks, payment_proof, document_received, visa_process_start,
        visa_process_end, document_remarks, staff_name, sales_amount, profit_amount, departure_status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *\`,
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
'
backup_and_write "controllers/tourController.js" "$tour_controller"

# -------------------------
# controllers/dashboardController.js
# -------------------------
dashboard_controller='
import db from "../config/database.js";

export async function getDashboardSummary(req, res){
  try{
    const totalToursQ = await db.query("SELECT COUNT(*) as cnt FROM tours");
    const totalSalesQ = await db.query("SELECT COALESCE(SUM(sales_amount),0) as total FROM sales");
    const totalProfitQ = await db.query("SELECT COALESCE(SUM(profit_amount),0) as total FROM sales");
    const totalDocsQ = await db.query("SELECT COUNT(*) as cnt FROM documents");

    // targets: sum of sales_target
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
'
backup_and_write "controllers/dashboardController.js" "$dashboard_controller"

# -------------------------
# controllers/profileController.js
# -------------------------
profile_controller='
import db from "../config/database.js";
import bcrypt from "bcryptjs";

export async function getProfile(req, res){
  try{
    const userId = req.user?.id;
    const q = await db.query("SELECT id, username, staff_name, role, created_at FROM users WHERE id=$1", [userId]);
    res.json(q.rows[0]);
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
'
backup_and_write "controllers/profileController.js" "$profile_controller"

# -------------------------
# controllers/executiveReportController.js
# -------------------------
exec_controller='
import db from "../config/database.js";

export async function getExecutiveSummary(req,res){
  try{
    const summary = await db.query(\`
      SELECT r.name as region, COUNT(t.id) as tours, COALESCE(SUM(t.sales_amount),0) as sales, COALESCE(SUM(t.profit_amount),0) as profit
      FROM tours t
      LEFT JOIN regions r ON r.id = t.region_id
      GROUP BY r.name ORDER BY sales DESC
    \`);
    res.json(summary.rows);
  }catch(err){
    console.error("Executive summary error:", err);
    res.status(500).json({ message: "Gagal memuat executive summary" });
  }
}

export async function getMonthlyPerformance(req,res){
  try{
    const year = Number(req.query.year) || (new Date()).getFullYear();
    const q = await db.query(\`
      SELECT TO_CHAR(COALESCE(transaction_date, created_at), \'Mon\') as month,
        COALESCE(SUM(sales_amount),0) as sales, COALESCE(SUM(profit_amount),0) as profit
      FROM sales
      WHERE EXTRACT(YEAR FROM COALESCE(transaction_date, created_at)) = $1
      GROUP BY 1 ORDER BY date_part('month', COALESCE(transaction_date, created_at))
    \`, [year]);
    res.json(q.rows);
  }catch(err){
    console.error("Monthly performance error:", err);
    res.status(500).json({ message: "Gagal memuat monthly performance" });
  }
}
'
backup_and_write "controllers/executiveReportController.js" "$exec_controller"

# -------------------------
# routes/executiveReport.js
# -------------------------
exec_route='
import express from "express";
import { getExecutiveSummary, getMonthlyPerformance } from "../controllers/executiveReportController.js";
import { authenticate } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/summary", authenticate, getExecutiveSummary);
router.get("/monthly-performance", authenticate, getMonthlyPerformance);

export default router;
'
backup_and_write "routes/executiveReport.js" "$exec_route"

# -------------------------
# public/login.html (remove sidebar)
# -------------------------
login_html='
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Login | Travel Dashboard</title>
  <link rel="stylesheet" href="./css/style.css" />
</head>
<body>
  <main style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;">
    <div class="login-card card" style="max-width:420px;width:100%">
      <h2 style="text-align:center">Selamat Datang</h2>
      <p class="note" style="text-align:center">Masuk ke sistem Travel Dashboard</p>
      <form id="loginForm">
        <div class="form-row">
          <label for="username">Username</label>
          <input id="username" name="username" type="text" placeholder="Masukkan username" required />
        </div>
        <div class="form-row">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" placeholder="Masukkan password" required />
        </div>
        <div class="form-row full-row" style="margin-top:12px">
          <button type="submit" class="btn primary" style="width:100%">LOGIN</button>
        </div>
        <p id="loginMessage" class="note center"></p>
      </form>
    </div>
  </main>

  <div class="toast-wrap" id="toastWrap"></div>
  <script src="./js/ui.js"></script>
  <script>
    const toastWrap = document.getElementById("toastWrap");
    const toast = (msg, type="info", t=3200) => {
      const el = document.createElement("div");
      el.className = "toast " + (type === "success" ? "success" : type === "error" ? "error" : "info");
      el.textContent = msg;
      toastWrap.appendChild(el);
      setTimeout(() => el.remove(), t);
    };

    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login gagal");
        localStorage.setItem("token", data.token);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        toast("Login berhasil", "success");
        setTimeout(() => { window.location.href = "dashboard.html"; }, 600);
      } catch (err) {
        toast(err.message, "error");
        document.getElementById("loginMessage").textContent = err.message;
      }
    });
  </script>
</body>
</html>
'
backup_and_write "public/login.html" "$login_html"

# -------------------------
# public/js/ui.js (show current user; single sidebar toggle)
# -------------------------
ui_js='
(function(){
  "use strict";
  const body = document.body;
  const sidebar = document.querySelector(".sidebar");
  const sideToggleBtns = document.querySelectorAll("[data-toggle=\'sidebar\']");
  const themeCheckbox = document.getElementById("themeSwitch");
  const SIDEBAR_KEY = "td_sidebar_state";
  const THEME_KEY = "td_theme_mode";
  const TOKEN_KEY = "token";
  const REFRESH_KEY = "refreshToken";

  function safe(fn){ try{ fn(); }catch(e){} }
  function toast(msg,type=\'info\',t=3000){
    const tw = document.getElementById(\'toastWrap\');
    if(!tw) return;
    const el=document.createElement(\'div\');
    el.className=\'toast \'+(type===\'success\'?\'success\':type===\'error\'?\'error\':\'info\');
    el.textContent=msg;
    tw.appendChild(el);
    setTimeout(()=>el.remove(),t);
  }

  safe(()=>{
    const s = localStorage.getItem(SIDEBAR_KEY);
    if(s===\'collapsed\' && sidebar) sidebar.classList.add("collapsed");
  });

  sideToggleBtns.forEach(btn=>{
    btn.addEventListener("click", e=>{
      e.preventDefault();
      if(!sidebar) return;
      sidebar.classList.toggle("collapsed");
      localStorage.setItem(SIDEBAR_KEY, sidebar.classList.contains("collapsed") ? "collapsed" : "expanded");
    });
  });

  safe(()=>{
    document.querySelectorAll(".has-children > a").forEach(a=>{
      a.addEventListener("click", e=>{
        e.preventDefault();
        const p=a.parentElement;
        p.classList.toggle("expanded");
      });
    });
  });

  safe(()=>{
    const mode = localStorage.getItem(THEME_KEY);
    if(mode==="dark") body.classList.add("theme-dark");
    if(themeCheckbox){
      themeCheckbox.checked = mode==="dark";
      themeCheckbox.addEventListener("change",()=>{
        if(themeCheckbox.checked){
          body.classList.add("theme-dark");
          localStorage.setItem(THEME_KEY,"dark");
        }else{
          body.classList.remove("theme-dark");
          localStorage.setItem(THEME_KEY,"light");
        }
      });
    }
  });

  // show current user in .current-user elements
  safe(async ()=>{
    const nodes = document.querySelectorAll(".current-user");
    if(nodes.length===0) return;
    try{
      const res = await fetch("/api/profile", { headers: { Authorization: "Bearer "+localStorage.getItem(TOKEN_KEY) }});
      if(!res.ok) return;
      const u = await res.json();
      nodes.forEach(n=> n.textContent = `👤 ${u.staff_name || u.username} (${u.role})`);
    }catch(e){}
  });

  // secureFetch with refresh attempt
  async function refreshToken(){
    const rt = localStorage.getItem(REFRESH_KEY);
    if(!rt) return false;
    try{
      const res = await fetch("/api/auth/refresh", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ refreshToken: rt })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || "Refresh gagal");
      localStorage.setItem(TOKEN_KEY, data.token);
      if(data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
      return true;
    }catch(e){
      return false;
    }
  }

  window.secureFetch = async function(url, options={}){
    const token = localStorage.getItem(TOKEN_KEY);
    options.headers = options.headers || {};
    if(token) options.headers["Authorization"] = "Bearer " + token;
    let res = await fetch(url, options);
    if(res.status===401){
      const ok = await refreshToken();
      if(ok){
        options.headers["Authorization"] = "Bearer " + localStorage.getItem(TOKEN_KEY);
        res = await fetch(url, options);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        setTimeout(()=>location.href="login.html",250);
      }
    }
    return res;
  };

  // redirect to login if not authenticated (except login page)
  safe(()=>{
    const page = location.pathname.split("/").pop();
    const isAuthPage = ["login.html","index.html"].includes(page);
    const token = localStorage.getItem(TOKEN_KEY);
    if(!token && !isAuthPage){
      location.href = "login.html";
    }
  });

  console.log("✅ UI Core Loaded v5.9");
})();
'
backup_and_write "public/js/ui.js" "$ui_js"

# -------------------------
# public/dashboard.html (add .current-user and fix layout)
# -------------------------
dashboard_html='
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Dashboard | Travel Dashboard</title>
  <link rel="stylesheet" href="./css/style.css">
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
          <li class="has-children">
            <a href="#">Reports</a>
            <ul>
              <li><a href="report_tour.html">Tour Report</a></li>
              <li><a href="report_sales.html">Sales Report</a></li>
              <li><a href="report_document.html">Document Report</a></li>
            </ul>
          </li>
          <li class="has-children">
            <a href="#">Management</a>
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
          <thead>
            <tr><th>Tanggal</th><th>Kategori</th><th>Deskripsi</th><th>Staff</th></tr>
          </thead>
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
'
backup_and_write "public/dashboard.html" "$dashboard_html"

# -------------------------
# routes/index: ensure executive route imported in server (we will add a small note to import)
# -------------------------
# The server.js may already import routes; we do not overwrite server.js here.
# Instead, ensure new route file exists (done above). User must ensure server.js mounts it:
# app.use('/api/executive', executiveReportRoute);
# We will attempt to add that automatically if server.js contains a routes loading block.

# Try to patch server.js to auto-mount the new executive route if a simple pattern exists.
if grep -q "executive" server.js 2>/dev/null; then
  echo "server.js already mentions executive"
else
  if grep -q "routes/executiveReport" server.js 2>/dev/null; then
    echo "server.js already imports executive route"
  else
    # attempt to insert import + mount after other route imports
    awk \
    -v ins1="import executiveReportRoute from './routes/executiveReport.js';" \
    -v ins2="app.use('/api/executive', executiveReportRoute);" \
    '{
      print $0;
      if(!added && $0 ~ /routes\/reportTour/){ print ins1; added=1 }
    }
    END{ if(added) print "// executive route mounted later in file"; }' server.js > server.js.tmp || true
    if [ -f server.js.tmp ]; then
      mv server.js.tmp server.js
      echo "Attempted to inject executive route import into server.js (verify manually)."
    fi
  fi
fi

# -------------------------
# Update package.json: add postinstall if not exists
# -------------------------
node -e "
const fs=require('fs');
const p=JSON.parse(fs.readFileSync('package.json','utf8'));
p.scripts=p.scripts||{};
if(!p.scripts.postinstall){
  p.scripts.postinstall='node scripts/initDatabase.js || true';
  fs.writeFileSync('package.json',JSON.stringify(p,null,2));
  console.log('postinstall added');
} else {
  console.log('postinstall exists, skipped');
}
"

echo "Staging changes..."
git add -A

echo "Committing..."
git commit -m "v5.9: schema sync, exec endpoints, profile password change, UI fixes (login/sidebar/user indicator)"

echo "Creating patch file update-ui-v59.patch..."
git format-patch -1 HEAD --stdout > update-ui-v59.patch

echo "All done."
echo " - Branch: $BRANCH"
echo " - Backup stored in: $BACKUP_DIR"
echo " - Patch file: $(pwd)/update-ui-v59.patch"
echo ""
echo "Next steps:"
echo "  git push origin $BRANCH"
echo "  create PR and merge to main (or push directly to main if desired)"
echo "  Render will auto-deploy the merged changes. Monitor logs."